import type { FishDesign } from '../../../types/common.types';

export interface SwimmingFishState {
  x: number;
  y: number;
  vx: number;  // velocity x
  vy: number;  // velocity y
  targetX: number;
  targetY: number;
  angle: number;
  scale: number;
  isVisible: boolean;
}

export class SwimmingFish {
  public fishDesign: FishDesign;
  public state: SwimmingFishState;
  private aquariumWidth: number;
  private aquariumHeight: number;
  private maxSpeed: number;
  private changeDirectionChance: number;
  private lastDirectionChange: number;

  constructor(
    fishDesign: FishDesign, 
    aquariumWidth: number, 
    aquariumHeight: number
  ) {
    this.fishDesign = fishDesign;
    this.aquariumWidth = aquariumWidth;
    this.aquariumHeight = aquariumHeight;
    
    // 魚ごとに異なる速度と行動パターンを設定
    this.maxSpeed = 0.5 + Math.random() * 1.0; // 0.5-1.5の速度
    this.changeDirectionChance = 0.002 + Math.random() * 0.003; // 方向転換確率
    this.lastDirectionChange = Date.now();

    // 初期位置をランダムに設定
    this.state = {
      x: Math.random() * (aquariumWidth - 100) + 50,
      y: Math.random() * (aquariumHeight - 100) + 50,
      vx: (Math.random() - 0.5) * this.maxSpeed,
      vy: (Math.random() - 0.5) * this.maxSpeed,
      targetX: 0,
      targetY: 0,
      angle: 0,
      scale: 0.6 + Math.random() * 0.4, // 0.6-1.0のスケール
      isVisible: true
    };

    this.setRandomTarget();
  }

  private setRandomTarget(): void {
    const margin = 80;
    this.state.targetX = margin + Math.random() * (this.aquariumWidth - margin * 2);
    this.state.targetY = margin + Math.random() * (this.aquariumHeight - margin * 2);
  }

  private updateVelocity(): void {
    const dx = this.state.targetX - this.state.x;
    const dy = this.state.targetY - this.state.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 目標に近づいた場合、新しい目標を設定
    if (distance < 30) {
      this.setRandomTarget();
      return;
    }

    // 目標に向かう力
    const targetForceX = (dx / distance) * this.maxSpeed * 0.1;
    const targetForceY = (dy / distance) * this.maxSpeed * 0.1;

    // 慣性を保持しつつ目標に向かう
    this.state.vx = this.state.vx * 0.95 + targetForceX;
    this.state.vy = this.state.vy * 0.95 + targetForceY;

    // 速度制限
    const currentSpeed = Math.sqrt(this.state.vx * this.state.vx + this.state.vy * this.state.vy);
    if (currentSpeed > this.maxSpeed) {
      this.state.vx = (this.state.vx / currentSpeed) * this.maxSpeed;
      this.state.vy = (this.state.vy / currentSpeed) * this.maxSpeed;
    }

    // 角度を速度に基づいて更新（魚が泳ぐ方向を向く）
    if (Math.abs(this.state.vx) > 0.1) {
      this.state.angle = Math.atan2(this.state.vy, this.state.vx);
    }
  }

  private handleBoundaryCollision(): void {
    const margin = 50;

    // 壁に近づいた場合の処理
    if (this.state.x < margin) {
      this.state.x = margin;
      this.state.vx = Math.abs(this.state.vx);
      this.setRandomTarget();
    } else if (this.state.x > this.aquariumWidth - margin) {
      this.state.x = this.aquariumWidth - margin;
      this.state.vx = -Math.abs(this.state.vx);
      this.setRandomTarget();
    }

    if (this.state.y < margin) {
      this.state.y = margin;
      this.state.vy = Math.abs(this.state.vy);
      this.setRandomTarget();
    } else if (this.state.y > this.aquariumHeight - margin) {
      this.state.y = this.aquariumHeight - margin;
      this.state.vy = -Math.abs(this.state.vy);
      this.setRandomTarget();
    }
  }

  private randomDirectionChange(): void {
    const now = Date.now();
    
    // 最低1秒間は同じ方向を維持
    if (now - this.lastDirectionChange < 1000) {
      return;
    }

    if (Math.random() < this.changeDirectionChance) {
      this.setRandomTarget();
      this.lastDirectionChange = now;
    }
  }

  public update(): void {
    // ランダムな方向転換
    this.randomDirectionChange();
    
    // 速度更新
    this.updateVelocity();
    
    // 位置更新
    this.state.x += this.state.vx;
    this.state.y += this.state.vy;
    
    // 境界処理
    this.handleBoundaryCollision();
  }

  public setVisibility(visible: boolean): void {
    this.state.isVisible = visible;
  }

  public getPosition(): { x: number; y: number; angle: number; scale: number } {
    return {
      x: this.state.x,
      y: this.state.y,
      angle: this.state.angle,
      scale: this.state.scale
    };
  }

  public resize(newWidth: number, newHeight: number): void {
    // 水槽サイズが変更された場合の対応
    const ratioX = newWidth / this.aquariumWidth;
    const ratioY = newHeight / this.aquariumHeight;
    
    this.state.x *= ratioX;
    this.state.y *= ratioY;
    this.state.targetX *= ratioX;
    this.state.targetY *= ratioY;
    
    this.aquariumWidth = newWidth;
    this.aquariumHeight = newHeight;
  }
}