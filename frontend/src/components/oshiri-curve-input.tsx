'use client';

'use client';

import React, { useState, useRef, MouseEvent, JSX } from 'react';
import { svgPathProperties } from 'svg-path-properties';


// 親コンポーネントに渡すデータの型定義
export interface CurveDataObject {
  path: string;
  strokeWidth: number;
  totalLength: number; // 線の長さ
  curveTightness: number; // 線の湾曲の強さ
  openingDirection: string; // 線の開きの方向
  symmetry: boolean; // 左右対称性
}

interface OshiriCurveInputProps {
  onCurveDataChange: (curveData: CurveDataObject | null) => void;
}

// 各線セグメントの型定義
interface PathSegment {
  d: string; // SVGパスデータ
  strokeWidth: number;
}

export function OshiriCurveInput({
  onCurveDataChange,
}: OshiriCurveInputProps): JSX.Element {
  // 状態を単一のパスから、セグメントの配列に変更
  const [segments, setSegments] = useState<PathSegment[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [baseStrokeWidth, setBaseStrokeWidth] = useState<number>(12); //基準となる太さ
  const svgRef = useRef<SVGSVGElement>(null);

  // 最後の点の情報（座標と時間）を保持するためのref
  const lastPointRef = useRef<{ x: number; y: number; timeStamp: number } | null>(
    null
  );

  const getCoordinates = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: MouseEvent<SVGSVGElement>) => {
    setIsDrawing(true);
    setSegments([]); // 描画開始時にセグメントをリセット
    const { x, y } = getCoordinates(e);
    lastPointRef.current = { x, y, timeStamp: e.timeStamp };
  };

  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !lastPointRef.current) return;

    const { x, y } = getCoordinates(e);
    const currentTimeStamp = e.timeStamp;

    const dx = x - lastPointRef.current.x;
    const dy = y - lastPointRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeElapsed = currentTimeStamp - lastPointRef.current.timeStamp;

    // 速度を計算 (ピクセル/ミリ秒)
    const speed = timeElapsed > 0 ? distance / timeElapsed : 0;

    // 速度に基づいて線の太さを計算
    const speedFactor = 2.5; // 速度が太さに与える影響の係数（調整可能）
    const minStroke = 2;
    const dynamicStrokeWidth = Math.max(
      minStroke,
      baseStrokeWidth - speed * speedFactor
    );

    // 新しいセグメントを作成
    const newSegment: PathSegment = {
      d: `M ${lastPointRef.current.x} ${lastPointRef.current.y} L ${x} ${y}`,
      strokeWidth: dynamicStrokeWidth,
    };

    setSegments((prev) => [...prev, newSegment]);
    lastPointRef.current = { x, y, timeStamp: currentTimeStamp };
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (segments.length > 0) {
      // 全セグメントのパスデータを結合
      const combinedPath = segments.map((s) => s.d).join(' ');
      // 全セグメントの太さの平均値を計算
      const avgStrokeWidth = segments.reduce((acc, s) => acc + s.strokeWidth, 0) / segments.length;

      // ここからmemo.tsxのロジックを組み込む
      const properties = new svgPathProperties(combinedPath);

      // 1. カーブの長さ
      const totalLength = properties.getTotalLength();

      // 2. 開始点と終了点（方向判定などに利用）
      const start = properties.getPointAtLength(0);
      const end = properties.getPointAtLength(totalLength);

      // 3. 開き方向の取得（ベクトル方向をざっくり判定）
      let openingDirection = "";
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        openingDirection = dx > 0 ? "right" : "left";
      } else {
        openingDirection = dy > 0 ? "down" : "up";
      }

      // 4. カーブの鋭さ（tightness）の計算（全長に対する直線距離の比率）
      const straightDist = Math.sqrt(dx * dx + dy * dy);
      const curveTightness = Number((1 - straightDist / totalLength).toFixed(2)); // 0: 直線, 1: 曲がり強い

      // 5. 左右対称性（中間点を左右比較：粗いが実用的）
      const steps = 20;
      let asymmetryScore = 0;
      for (let i = 0; i < steps / 2; i++) {
        const p1 = properties.getPointAtLength((i / steps) * totalLength);
        const p2 = properties.getPointAtLength(((steps - i - 1) / steps) * totalLength);
        asymmetryScore += Math.abs(p1.y - p2.y); // y方向の対称性で見る
      }
      const symmetry = asymmetryScore < 10 ? true : false;

      onCurveDataChange({
        path: combinedPath,
        strokeWidth: avgStrokeWidth,
        totalLength,
        curveTightness,
        openingDirection,
        symmetry,
      });
    }

    lastPointRef.current = null;
  };

  const handleClear = () => {
    setSegments([]);
    onCurveDataChange(null);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <label htmlFor="stroke-width-slider" className="font-semibold">
          基準の太さ: {baseStrokeWidth}
        </label>
        <input
          id="stroke-width-slider"
          type="range"
          min="2"
          max="40"
          value={baseStrokeWidth}
          onChange={(e) => setBaseStrokeWidth(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <svg
        ref={svgRef}
        className="w-full h-64 bg-gray-100 rounded cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.d}
            stroke="black"
            strokeWidth={segment.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <button
        onClick={handleClear}
        className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        クリア
      </button>
    </div>
  );
}