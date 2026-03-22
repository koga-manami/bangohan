import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ingredients-memo
export async function GET() {
  const memo = await prisma.ingredientsMemo.findFirst({
    orderBy: { id: "desc" },
  });

  return NextResponse.json(memo ?? { id: null, memo_text: "" });
}

// POST /api/ingredients-memo
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { memo_text } = body;

  // 既存レコードを更新するか、なければ新規作成
  const existing = await prisma.ingredientsMemo.findFirst({
    orderBy: { id: "desc" },
  });

  let memo;
  if (existing) {
    memo = await prisma.ingredientsMemo.update({
      where: { id: existing.id },
      data: { memo_text: memo_text ?? "" },
    });
  } else {
    memo = await prisma.ingredientsMemo.create({
      data: { memo_text: memo_text ?? "" },
    });
  }

  return NextResponse.json(memo);
}
