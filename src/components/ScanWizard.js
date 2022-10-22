import React, { useState, useRef } from 'react';
import Scanner from './Scanner';
import Result from './Result';

const App = () => {
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState([]);
    const scannerRef = useRef(null);

    return (
        <div>
            <button onClick={() => setScanning(!scanning) }>{scanning ? 'Stop' : 'Start'}</button>
            <ul className="results">
                {results.map((result) => (result.codeResult && <Result key={result.codeResult.code} result={result} />))}
            </ul>
            <div ref={scannerRef} style={{position: 'relative', border: '3px solid red'}}>
                {/* <video style={{ width: window.innerWidth, height: 480, border: '3px solid orange' }}/> */}
                <div style={{position: 'absolute', top: '0px', opacity: '0.8', height: '100vh', width: '100vw' }}></div>
                <canvas className="drawingBuffer" style={{
                    position: 'absolute',
                    top: '0px',
                    // left: '0px',
                    height: '100vh',
                    width: '100vw',
                    opacity: '0.1',
                    border: '3px solid green',
                }} width="100vw" height="100vh" />
                {scanning ? <Scanner scannerRef={scannerRef} onDetected={(result) => setResults([...results, result])} /> : null}
            </div>
        </div>
    );
};

export default App;
