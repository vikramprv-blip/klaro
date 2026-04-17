import { NextRequest, NextResponse } from "next/server";
import { updateWorkStatusSchema } from "@/lib/validations/work-item";
import { updateWorkStatus } from "@/lib/services/work-items";

type RouteContext = { params: Promise<{ id: string }> }
