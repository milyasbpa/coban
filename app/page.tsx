export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button className="text-text-primary font-medium">menu</button>
        <button className="text-text-primary font-medium">Report</button>
      </div>

      {/* Level Section */}
      <div className="text-center mb-8">
        <div className="inline-flex bg-character-dark rounded-full px-6 py-2 mb-4">
          <span className="text-text-primary font-medium">Level</span>
        </div>
        
        <div className="flex justify-center gap-4 mb-8">
          <button className="bg-accent-secondary border-2 border-accent-secondary rounded-full px-6 py-2 font-bold text-text-primary">
            N5
          </button>
          <button className="bg-bg-card rounded-full px-6 py-2 font-medium text-text-secondary hover:bg-bg-hover transition-colors">
            N4
          </button>
          <button className="bg-bg-card rounded-full px-6 py-2 font-medium text-text-secondary hover:bg-bg-hover transition-colors">
            N3
          </button>
        </div>
      </div>

      {/* Category Section */}
      <div className="text-center mb-8">
        <div className="inline-flex bg-character-dark rounded-full px-6 py-2 mb-6">
          <span className="text-text-primary font-medium">Category</span>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-success shadow-lg">
              <span className="text-2xl font-bold text-character-dark">漢</span>
            </div>
            <span className="text-sm font-medium text-character-dark bg-success px-3 py-1 rounded-full shadow-md">Kanji</span>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-bg-hover transition-colors cursor-pointer border border-border-light">
              <span className="text-2xl font-bold text-text-primary">単</span>
            </div>
            <span className="text-sm font-medium text-text-secondary">Vocabulary</span>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-bg-hover transition-colors cursor-pointer border border-border-light">
              <span className="text-2xl font-bold text-text-primary">文</span>
            </div>
            <span className="text-sm font-medium text-text-secondary">Grammar</span>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-bg-card rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-bg-hover transition-colors cursor-pointer border border-border-light">
              <span className="text-2xl font-bold text-text-primary">聴</span>
            </div>
            <span className="text-sm font-medium text-text-secondary">Listening</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex gap-4 mb-6 px-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="filter" defaultChecked className="w-4 h-4 text-accent-primary accent-accent-primary" />
          <span className="text-text-primary font-medium">All</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="filter" className="w-4 h-4 accent-accent-primary" />
          <span className="text-text-secondary font-medium">Completed</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="filter" className="w-4 h-4 accent-accent-primary" />
          <span className="text-text-secondary font-medium">Uncompleted</span>
        </label>
      </div>

      {/* N5 Kanji List Header */}
      <div className="bg-character-dark rounded-lg px-6 py-4 mb-6">
        <div className="flex items-center justify-center gap-2">
          <div className="grid grid-cols-3 gap-1">
            <div className="w-2 h-2 bg-text-primary rounded-full"></div>
            <div className="w-2 h-2 bg-text-primary rounded-full"></div>
            <div className="w-2 h-2 bg-text-primary rounded-full"></div>
            <div className="w-2 h-2 bg-text-primary rounded-full"></div>
            <div className="w-2 h-2 bg-text-primary rounded-full"></div>
            <div className="w-2 h-2 bg-text-primary rounded-full"></div>
          </div>
          <span className="text-text-primary font-bold text-lg ml-2">N5 Kanji list</span>
        </div>
      </div>

      {/* Lesson Cards */}
      <div className="space-y-4">
        {/* Lesson 1 */}
        <div className="bg-bg-card rounded-lg p-4 shadow-lg border border-border-light hover:border-border-focus hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="bg-accent-secondary text-text-primary px-3 py-1 rounded font-bold text-sm shadow-sm">N5</span>
              <span className="bg-success text-character-dark px-4 py-1 rounded-full font-bold text-sm shadow-sm">Lesson 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-bg-tertiary rounded-full overflow-hidden shadow-inner">
                <div className="w-[97%] h-full bg-success rounded-full shadow-sm"></div>
              </div>
              <span className="text-text-primary font-bold text-sm">97%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 text-2xl text-text-primary">
              <span className="hover:text-success transition-colors cursor-pointer">一</span>
              <span className="hover:text-success transition-colors cursor-pointer">二</span>
              <span className="hover:text-success transition-colors cursor-pointer">三</span>
              <span className="hover:text-success transition-colors cursor-pointer">四</span>
              <span className="hover:text-success transition-colors cursor-pointer">五</span>
            </div>
            <button className="bg-character-dark text-text-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-character-light transition-colors shadow-md">
              <div className="grid grid-cols-3 gap-0.5">
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
              </div>
              List
            </button>
          </div>
          
          <button className="w-full bg-accent-secondary text-text-primary font-bold py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Exercise
          </button>
        </div>

        {/* Lesson 2 */}
        <div className="bg-bg-card rounded-lg p-4 shadow-lg border border-border-light hover:border-border-focus hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="bg-accent-secondary text-text-primary px-3 py-1 rounded font-bold text-sm shadow-sm">N5</span>
              <span className="bg-success text-character-dark px-4 py-1 rounded-full font-bold text-sm shadow-sm">Lesson 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-bg-tertiary rounded-full overflow-hidden shadow-inner">
                <div className="w-[97%] h-full bg-success rounded-full shadow-sm"></div>
              </div>
              <span className="text-text-primary font-bold text-sm">97%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 text-2xl text-text-primary">
              <span className="hover:text-success transition-colors cursor-pointer">六</span>
              <span className="hover:text-success transition-colors cursor-pointer">七</span>
              <span className="hover:text-success transition-colors cursor-pointer">八</span>
              <span className="hover:text-success transition-colors cursor-pointer">九</span>
              <span className="hover:text-success transition-colors cursor-pointer">十</span>
            </div>
            <button className="bg-character-dark text-text-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-character-light transition-colors shadow-md">
              <div className="grid grid-cols-3 gap-0.5">
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
                <div className="w-1 h-1 bg-text-primary rounded-full"></div>
              </div>
              List
            </button>
          </div>
          
          <button className="w-full bg-accent-secondary text-text-primary font-bold py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
