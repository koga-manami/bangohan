import MealPlanClient from "./components/MealPlanClient";

export default function Home() {
  return (
    <div className="max-w-[600px] mx-auto">
      {/* ヘッダー */}
      <header
        className="sticky z-50 text-white text-center py-3"
        style={{
          backgroundColor: "#555555",
          top: "var(--sat)",
        }}
      >
        <h1
          className="text-2xl tracking-wide"
          style={{
            fontFamily:
              "'HGS\u5275\u82F1\u89D2\uFF7A\uFF9E\uFF7C\uFF6F\uFF78UB', 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
            fontWeight: 900,
          }}
        >
          ばんごはん.com
        </h1>
      </header>

      <MealPlanClient />
    </div>
  );
}
