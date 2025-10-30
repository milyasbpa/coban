import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
          className="text-foreground font-medium p-0 h-auto"
        >
          menu
        </Button>
        <Button
          variant="ghost"
          className="text-foreground font-medium p-0 h-auto"
        >
          Report
        </Button>
      </div>

      {/* Level Section */}
      <div className="text-center mb-8">
        <Badge
          variant="secondary"
          className="mb-4 px-6 py-2 text-sm font-medium"
          style={{
            backgroundColor: "var(--character-dark)",
            color: "var(--foreground)",
          }}
        >
          Level
        </Badge>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            className="rounded-full px-6 py-2 font-bold border-2"
            style={{ borderColor: "var(--primary)" }}
          >
            N5
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-6 py-2 font-medium"
          >
            N4
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-6 py-2 font-medium"
          >
            N3
          </Button>
        </div>
      </div>

      {/* Category Section */}
      <div className="text-center mb-8">
        <Badge
          variant="secondary"
          className="mb-6 px-6 py-2 text-sm font-medium"
          style={{
            backgroundColor: "var(--character-dark)",
            color: "var(--foreground)",
          }}
        >
          Category
        </Badge>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <Button
              variant="secondary"
              size="icon"
              className="w-16 h-16 rounded-full mb-2 border-2 shadow-lg text-2xl font-bold"
            >
              漢
            </Button>
            <Badge variant="secondary" className="text-xs font-medium">
              Kanji
            </Badge>
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full mb-2 text-2xl font-bold"
            >
              単
            </Button>
            <span className="text-sm font-medium text-muted-foreground block">
              Vocabulary
            </span>
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full mb-2 text-2xl font-bold"
            >
              文
            </Button>
            <span className="text-sm font-medium text-muted-foreground block">
              Grammar
            </span>
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full mb-2 text-2xl font-bold"
            >
              聴
            </Button>
            <span className="text-sm font-medium text-muted-foreground block">
              Listening
            </span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex gap-4 mb-6 px-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="filter"
            defaultChecked
            className="w-4 h-4 accent-primary"
          />
          <span className="text-foreground font-medium">All</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="filter"
            className="w-4 h-4 accent-primary"
          />
          <span className="text-muted-foreground font-medium">Completed</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="filter"
            className="w-4 h-4 accent-primary"
          />
          <span className="text-muted-foreground font-medium">Uncompleted</span>
        </label>
      </div>

      {/* N5 Kanji List Header */}
      <Card
        className="mb-6"
        style={{ backgroundColor: "var(--character-dark)" }}
      >
        <CardContent className="px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-foreground rounded-full"
                ></div>
              ))}
            </div>
            <span className="text-foreground font-bold text-lg ml-2">
              N5 Kanji list
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Cards */}
      <div className="space-y-4">
        {/* Lesson 1 */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:border-ring">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Badge className="font-bold text-sm">N5</Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full font-bold text-sm"
                >
                  Lesson 1
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={97} className="w-32 h-2" />
                <span className="text-foreground font-bold text-sm">97%</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 text-2xl text-foreground">
                {["一", "二", "三", "四", "五"].map((kanji, i) => (
                  <span
                    key={i}
                    className="hover:text-secondary transition-colors cursor-pointer"
                  >
                    {kanji}
                  </span>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                style={{
                  backgroundColor: "var(--character-dark)",
                  color: "var(--foreground)",
                }}
              >
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-foreground rounded-full"
                    ></div>
                  ))}
                </div>
                List
              </Button>
            </div>

            <Button className="w-full font-bold">Exercise</Button>
          </CardContent>
        </Card>

        {/* Lesson 2 */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:border-ring">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Badge className="font-bold text-sm">N5</Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full font-bold text-sm"
                >
                  Lesson 2
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={97} className="w-32 h-2" />
                <span className="text-foreground font-bold text-sm">97%</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 text-2xl text-foreground">
                {["六", "七", "八", "九", "十"].map((kanji, i) => (
                  <span
                    key={i}
                    className="hover:text-secondary transition-colors cursor-pointer"
                  >
                    {kanji}
                  </span>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                style={{
                  backgroundColor: "var(--character-dark)",
                  color: "var(--foreground)",
                }}
              >
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-foreground rounded-full"
                    ></div>
                  ))}
                </div>
                List
              </Button>
            </div>

            <Button className="w-full font-bold">Exercise</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
