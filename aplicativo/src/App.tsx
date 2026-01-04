import { ImageProvider } from "./contexts/ImageContext";
import { LayerProvider } from "./contexts/LayerContext";
import { MaskProvider } from "./contexts/MaskContext";
import { MainLayout } from "./components/layout/MainLayout";
import "./index.css";

function App() {
  return (
    <ImageProvider>
      <LayerProvider>
        <MaskProvider>
          <MainLayout />
        </MaskProvider>
      </LayerProvider>
    </ImageProvider>
  );
}

export default App;
