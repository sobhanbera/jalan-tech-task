import React from "react";
import ImageCanvas from "./components/ImageCanvas";

const App: React.FC = () => {
    const exportImage = () => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = "roof.png";
            link.click();
        }
    };

    return <ImageCanvas exportImage={exportImage} />;
};

export default App;
