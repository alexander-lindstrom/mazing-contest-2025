import GridRenderer from "./components/gridRenderer";
import { defaultGrid } from "./types/grid";

function App() {
  const gridProps = defaultGrid

  return (
    <div className="App">
      <h1>Grid Renderer</h1>
      <GridRenderer {...gridProps} />
    </div>
  )
}

export default App;