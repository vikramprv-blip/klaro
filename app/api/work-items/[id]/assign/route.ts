import { NextRequest, NextResponse } from "next/server";
import { assignWorkItemSchema } from "@/lib/validations/work-item";
import { assignWorkItem } from "@/lib/services/work-items";

type RouteContext = { params: Promise<{ id: string }> }
