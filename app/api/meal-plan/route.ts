import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/meal-plan?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to parameters are required" },
      { status: 400 }
    );
  }

  const fromDate = new Date(from + "T00:00:00");
  const toDate = new Date(to + "T00:00:00");

  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      date: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(mealPlans);
}

// POST /api/meal-plan
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, menu_text, schedule_text } = body;

  if (!date) {
    return NextResponse.json(
      { error: "date is required" },
      { status: 400 }
    );
  }

  const dateObj = new Date(date + "T00:00:00");

  const mealPlan = await prisma.mealPlan.upsert({
    where: { date: dateObj },
    update: {
      menu_text: menu_text ?? null,
      schedule_text: schedule_text ?? null,
    },
    create: {
      date: dateObj,
      menu_text: menu_text ?? null,
      schedule_text: schedule_text ?? null,
    },
  });

  return NextResponse.json(mealPlan);
}
