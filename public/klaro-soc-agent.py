#!/usr/bin/env python3
"""
Klaro Pulse SOC Agent — Local / Self-Hosted Scanner
Phase 2: Scans internal infrastructure that can't be seen from outside.

Usage:
    python3 klaro-soc-agent.py --token YOUR_TOKEN --url https://yoursite.com

Requirements:
    pip install requests python-dotenv

No other dependencies needed. Runs on Mac, Linux, Windows.
"""

import sys
import os
import re
import json
import socket
import subprocess
import platform
import argparse
import hashlib
import datetime
import ssl
import urllib.request
import urllib.parse
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://chwyrdublpuavcmjendw.supabase.co"
AGENT_VERSION = "1.0.0"

# ── Helpers ───────────────────────────────────────────────────────────────────

def log(msg, level="INFO"):
    colors = {"INFO": "\033[94m", "OK": "\033[92m", "WARN": "\033[93m", "FAIL": "\033[91m", "RESET": "\033[0m"}
    prefix = {"INFO": "→", "OK": "✓", "WARN": "⚠", "FAIL": "✗"}
    print(f"  {colors.get(level,'')}{prefix.get(level,'→')} {msg}{colors['RESET']}")

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def supabase_insert(table, data, service_key):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("apikey", service_key)
    req.add_header("Authorization", f"Bearer {service_key}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  Supabase error: {e}")
        return None

def supabase_get(table, params, service_key):
    qs = urllib.parse.urlencode(params)
    url = f"{SUPABASE_URL}/rest/v1/{table}?{qs}"
    req = urllib.request.Request(url)
    req.add_header("apikey", service_key)
    req.add_header("Authorization", f"Bearer {service_key}")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  Supabase GET error: {e}")
        return []

# ── Checks ────────────────────────────────────────────────────────────────────

def check_open_ports(hostname):
    """Scan common sensitive ports"""
    section("PORT SCAN — Sensitive Services")
    sensitive_ports = {
        21: "FTP",
        22: "SSH",
        23: "Telnet",
        25: "SMTP",
        3306: "MySQL",
        5432: "PostgreSQL",
        6379: "Redis",
        27017: "MongoDB",
        8080: "HTTP Alt",
        8443: "HTTPS Alt",
        9200: "Elasticsearch",
        5601: "Kibana",
        4000: "Dev server",
        3000: "Dev server",
        8000: "Dev server",
    }
    results = {}
    for port, service in sensitive_ports.items():
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((hostname, port))
            sock.close()
            is_open = result == 0
            results[str(port)] = {"service": service, "open": is_open}
            if is_open:
                log(f"Port {port} ({service}) — OPEN", "WARN" if port not in [22] else "INFO")
            else:
                log(f"Port {port} ({service}) — closed", "OK")
        except Exception:
            results[str(port)] = {"service": service, "open": False}
    return results

def check_ssl_cert(hostname):
    """Check SSL certificate expiry"""
    section("SSL CERTIFICATE")
    results = {"valid": False, "expires_in_days": 0, "issuer": "", "error": ""}
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=hostname) as s:
            s.settimeout(5)
            s.connect((hostname, 443))
            cert = s.getpeercert()
            expiry_str = cert.get("notAfter", "")
            expiry = datetime.datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z")
            days_left = (expiry - datetime.datetime.utcnow()).days
            issuer = dict(x[0] for x in cert.get("issuer", []))
            results = {
                "valid": True,
                "expires_in_days": days_left,
                "expiry_date": expiry.strftime("%Y-%m-%d"),
                "issuer": issuer.get("organizationName", "Unknown"),
                "error": ""
            }
            if days_left < 30:
                log(f"Certificate expires in {days_left} days — RENEW SOON", "WARN")
            elif days_left < 14:
                log(f"Certificate expires in {days_left} days — CRITICAL", "FAIL")
            else:
                log(f"Certificate valid for {days_left} days (expires {expiry.strftime('%Y-%m-%d')})", "OK")
    except Exception as e:
        results["error"] = str(e)
        log(f"SSL check failed: {e}", "FAIL")
    return results

def check_env_files(scan_paths):
    """Look for exposed .env files and secrets in common locations"""
    section("SECRETS & ENV FILE SCAN")
    results = {"exposed_files": [], "secret_patterns_found": [], "scanned_paths": []}

    # Common paths to check for accidentally committed/exposed files
    dangerous_paths = [
        ".env", ".env.local", ".env.production", ".env.development",
        ".env.backup", "config.json", "secrets.json", "credentials.json",
        "database.yml", "config/database.yml", "wp-config.php",
        "config/secrets.yml", ".aws/credentials",
    ]

    secret_patterns = [
        (r'(?i)(api[_-]?key|apikey)\s*[=:]\s*["\']?([A-Za-z0-9_\-]{20,})', "API Key"),
        (r'(?i)(secret[_-]?key|secret)\s*[=:]\s*["\']?([A-Za-z0-9_\-]{20,})', "Secret Key"),
        (r'(?i)(password|passwd|pwd)\s*[=:]\s*["\']?([^\s"\']{8,})', "Password"),
        (r'(?i)(aws[_-]?access[_-]?key[_-]?id)\s*[=:]\s*([A-Z0-9]{20})', "AWS Access Key"),
        (r'(?i)(database[_-]?url|db[_-]?url)\s*[=:]\s*["\']?(postgres|mysql|mongodb)[^\s"\']+', "DB Connection String"),
        (r'ghp_[A-Za-z0-9]{36}', "GitHub PAT"),
        (r'sk-[A-Za-z0-9]{48}', "OpenAI Key"),
        (r'gsk_[A-Za-z0-9]{50,}', "Groq Key"),
    ]

    for scan_path in scan_paths:
        p = Path(scan_path)
        if not p.exists():
            continue
        results["scanned_paths"].append(str(p))

        # Check for env files
        for dangerous in dangerous_paths:
            fp = p / dangerous
            if fp.exists():
                results["exposed_files"].append(str(fp))
                log(f"Found: {fp}", "WARN")

        # Scan code files for secret patterns
        code_extensions = ['.py', '.js', '.ts', '.tsx', '.env', '.json', '.yml', '.yaml', '.sh']
        for ext in code_extensions:
            for f in list(p.rglob(f'*{ext}'))[:200]:  # limit to 200 files
                if 'node_modules' in str(f) or '.git' in str(f):
                    continue
                try:
                    content = f.read_text(errors='ignore')
                    for pattern, label in secret_patterns:
                        matches = re.findall(pattern, content)
                        if matches:
                            results["secret_patterns_found"].append({
                                "file": str(f.relative_to(p)),
                                "type": label,
                                "count": len(matches)
                            })
                            log(f"Possible {label} in {f.relative_to(p)}", "WARN")
                except Exception:
                    continue

    if not results["exposed_files"] and not results["secret_patterns_found"]:
        log("No exposed env files or secret patterns found", "OK")

    return results

def check_dependencies(scan_path):
    """Run npm audit and pip audit if available"""
    section("DEPENDENCY VULNERABILITY SCAN")
    results = {"npm": {}, "pip": {}, "total_vulnerabilities": 0}

    p = Path(scan_path)

    # npm audit
    package_json = p / "package.json"
    if package_json.exists():
        try:
            log("Running npm audit...")
            result = subprocess.run(
                ["npm", "audit", "--json"],
                cwd=str(p), capture_output=True, text=True, timeout=60
            )
            audit_data = json.loads(result.stdout) if result.stdout else {}
            vulns = audit_data.get("metadata", {}).get("vulnerabilities", {})
            total = sum(vulns.values()) if vulns else 0
            results["npm"] = {
                "total": total,
                "critical": vulns.get("critical", 0),
                "high": vulns.get("high", 0),
                "moderate": vulns.get("moderate", 0),
                "low": vulns.get("low", 0),
            }
            results["total_vulnerabilities"] += total
            if total == 0:
                log("npm: No vulnerabilities found", "OK")
            else:
                log(f"npm: {total} vulnerabilities ({vulns.get('critical',0)} critical, {vulns.get('high',0)} high)", "WARN")
        except FileNotFoundError:
            log("npm not found — skipping", "INFO")
        except Exception as e:
            log(f"npm audit error: {e}", "WARN")

    # pip audit
    requirements = p / "requirements.txt"
    if requirements.exists():
        try:
            log("Running pip audit...")
            result = subprocess.run(
                ["pip", "audit", "--format=json", "-r", str(requirements)],
                capture_output=True, text=True, timeout=60
            )
            audit_data = json.loads(result.stdout) if result.stdout else []
            total = len(audit_data)
            results["pip"] = {"total": total, "vulnerabilities": audit_data[:10]}
            results["total_vulnerabilities"] += total
            if total == 0:
                log("pip: No vulnerabilities found", "OK")
            else:
                log(f"pip: {total} vulnerable packages", "WARN")
        except FileNotFoundError:
            log("pip audit not found — install with: pip install pip-audit", "INFO")
        except Exception as e:
            log(f"pip audit error: {e}", "WARN")

    return results

def check_http_headers(url):
    """Check security headers from inside the network"""
    section("HTTP SECURITY HEADERS")
    results = {}
    try:
        req = urllib.request.Request(url)
        req.add_header("User-Agent", "Klaro-SOC-Agent/1.0")
        with urllib.request.urlopen(req, timeout=10) as r:
            headers = dict(r.headers)
            security_headers = {
                "strict-transport-security": "HSTS",
                "content-security-policy": "CSP",
                "x-frame-options": "X-Frame-Options",
                "x-content-type-options": "X-Content-Type-Options",
                "permissions-policy": "Permissions-Policy",
                "referrer-policy": "Referrer-Policy",
            }
            for header, label in security_headers.items():
                val = headers.get(header) or headers.get(header.title())
                present = bool(val)
                results[header.replace("-", "_")] = {"present": present, "value": val}
                if present:
                    log(f"{label}: {val[:60] if val else 'present'}", "OK")
                else:
                    log(f"{label}: MISSING", "FAIL")
    except Exception as e:
        log(f"Header check failed: {e}", "WARN")
    return results

def check_admin_access(url):
    """Check for exposed admin panels on internal ports"""
    section("ADMIN PANEL EXPOSURE")
    results = {"exposed": [], "checked": []}
    parsed = urllib.parse.urlparse(url)
    hostname = parsed.hostname

    paths_to_check = [
        "/admin", "/wp-admin", "/phpmyadmin", "/adminer",
        "/admin/login", "/backend", "/_admin", "/manage",
        "/console", "/dashboard", "/control-panel",
    ]

    for path in paths_to_check:
        test_url = f"https://{hostname}{path}"
        results["checked"].append(test_url)
        try:
            req = urllib.request.Request(test_url)
            req.add_header("User-Agent", "Klaro-SOC-Agent/1.0")
            with urllib.request.urlopen(req, timeout=5) as r:
                if r.status == 200:
                    results["exposed"].append(test_url)
                    log(f"{path} — EXPOSED (200)", "FAIL")
                else:
                    log(f"{path} — {r.status}", "OK")
        except urllib.error.HTTPError as e:
            if e.code in [401, 403]:
                log(f"{path} — {e.code} (protected)", "OK")
            else:
                log(f"{path} — {e.code}", "OK")
        except Exception:
            log(f"{path} — not accessible", "OK")

    return results

def check_system_info():
    """Collect basic system info for the evidence record"""
    section("SYSTEM INFO")
    info = {
        "os": platform.system(),
        "os_version": platform.version()[:100],
        "python_version": platform.python_version(),
        "hostname": socket.gethostname(),
        "scan_time": datetime.datetime.utcnow().isoformat(),
    }
    log(f"OS: {info['os']} {platform.release()}", "INFO")
    log(f"Python: {info['python_version']}", "INFO")
    log(f"Machine: {info['hostname']}", "INFO")
    return info

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Klaro Pulse SOC Agent — Internal Scanner")
    parser.add_argument("--token", required=True, help="Your Klaro Pulse API token (from dashboard)")
    parser.add_argument("--url", required=True, help="Your website URL e.g. https://yoursite.com")
    parser.add_argument("--scan-path", default=".", help="Local path to scan for secrets/dependencies (default: current dir)")
    parser.add_argument("--scan-id", help="Link to an existing cloud SOC scan ID")
    args = parser.parse_args()

    print("\n" + "="*60)
    print("  KLARO PULSE SOC AGENT v" + AGENT_VERSION)
    print("  Internal Infrastructure Scanner")
    print(f"  Target: {args.url}")
    print(f"  Path: {os.path.abspath(args.scan_path)}")
    print("="*60)

    # Validate token against Supabase
    log("Validating token...")
    token_data = supabase_get(
        "soc_agent_tokens",
        {"token": f"eq.{args.token}", "active": "eq.true"},
        args.token  # token doubles as service key for validation
    )

    # For now use token as both auth and service key
    # In production: validate token, get user_id and service key
    service_key = args.token
    user_id = None

    parsed = urllib.parse.urlparse(args.url)
    hostname = parsed.hostname

    # Run all checks
    sys_info = check_system_info()
    port_results = check_open_ports(hostname)
    ssl_results = check_ssl_cert(hostname)
    header_results = check_http_headers(args.url)
    admin_results = check_admin_access(args.url)
    env_results = check_env_files([args.scan_path])
    dep_results = check_dependencies(args.scan_path)

    # Build score
    score = 0
    if ssl_results.get("valid"): score += 20
    if ssl_results.get("expires_in_days", 0) > 30: score += 10
    if not admin_results.get("exposed"): score += 20
    if not env_results.get("exposed_files"): score += 15
    if not env_results.get("secret_patterns_found"): score += 15
    if dep_results.get("total_vulnerabilities", 0) == 0: score += 10
    open_sensitive = [p for p, v in port_results.items() if v.get("open") and int(p) not in [22, 80, 443]]
    if not open_sensitive: score += 10

    # Build gaps
    gaps = []
    if admin_results.get("exposed"):
        for path in admin_results["exposed"]:
            gaps.append({"control": f"Admin path exposed: {path}", "severity": "Critical", "criterion": "Security (CC6.3)", "fix": "Add authentication and IP restriction", "effort": "1 day", "cost": "$0"})
    if env_results.get("exposed_files"):
        gaps.append({"control": "Sensitive files accessible", "severity": "Critical", "criterion": "Security (CC6.1)", "fix": "Remove .env files from web root and add to .gitignore", "effort": "1 hour", "cost": "$0"})
    if env_results.get("secret_patterns_found"):
        for s in env_results["secret_patterns_found"][:5]:
            gaps.append({"control": f"Possible {s['type']} in {s['file']}", "severity": "High", "criterion": "Security (CC6.1)", "fix": "Move secrets to environment variables, rotate keys", "effort": "2 hours", "cost": "$0"})
    if ssl_results.get("expires_in_days", 99) < 30:
        gaps.append({"control": f"SSL expires in {ssl_results['expires_in_days']} days", "severity": "High", "criterion": "Availability (A1.1)", "fix": "Renew SSL certificate immediately", "effort": "1 hour", "cost": "$0-100"})
    if dep_results.get("total_vulnerabilities", 0) > 0:
        gaps.append({"control": f"{dep_results['total_vulnerabilities']} dependency vulnerabilities", "severity": "High", "criterion": "Security (CC7.1)", "fix": "Run npm audit fix or pip install --upgrade for affected packages", "effort": "2-4 hours", "cost": "$0"})
    for port, info in port_results.items():
        if info.get("open") and int(port) not in [22, 80, 443, 8080]:
            gaps.append({"control": f"Port {port} ({info['service']}) open", "severity": "Medium", "criterion": "Security (CC6.6)", "fix": f"Close port {port} or restrict to internal network only", "effort": "30 mins", "cost": "$0"})

    # Save to Supabase
    section("SAVING RESULTS")
    evidence = {
        "agent_version": AGENT_VERSION,
        "system": sys_info,
        "ssl": ssl_results,
        "ports": port_results,
        "headers": header_results,
        "admin_exposure": admin_results,
        "secrets_scan": {
            "exposed_files": env_results.get("exposed_files", []),
            "secret_patterns_count": len(env_results.get("secret_patterns_found", [])),
            "scanned_paths": env_results.get("scanned_paths", []),
        },
        "dependencies": {
            "total_vulnerabilities": dep_results.get("total_vulnerabilities", 0),
            "npm": dep_results.get("npm", {}),
            "pip": dep_results.get("pip", {}).get("total", 0),
        },
        "scan_type": "internal_agent",
    }

    result = supabase_insert("soc_agent_scans", {
        "url": args.url,
        "hostname": hostname,
        "agent_version": AGENT_VERSION,
        "internal_score": score,
        "gaps_count": len(gaps),
        "critical_gaps": len([g for g in gaps if g["severity"] == "Critical"]),
        "high_gaps": len([g for g in gaps if g["severity"] == "High"]),
        "evidence": evidence,
        "gaps": gaps,
        "cloud_scan_id": args.scan_id,
        "scanned_at": sys_info["scan_time"],
    }, service_key)

    # Print summary
    section("SUMMARY")
    print(f"\n  Internal SOC Score: {score}/100")
    print(f"  Gaps found: {len(gaps)} ({len([g for g in gaps if g['severity'] == 'Critical'])} critical)")
    print(f"\n  TOP GAPS TO FIX:")
    for g in gaps[:5]:
        print(f"    [{g['severity']}] {g['control']}")
        print(f"           → {g['fix']}")
    print(f"\n  Full report: https://klaro.services/pulse/soc")
    print(f"\n{'='*60}\n")

if __name__ == "__main__":
    main()
