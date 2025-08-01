import type { FishDesign, Ripple } from '../../../types/common.types';

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
  isChasing: boolean;      // 波紋を追いかけているか
  chasingRippleId?: string; // 追いかけている波紋のID
  baseSpeed: number;       // 基本速度
}

export class SwimmingFish {
  public fishDesign: FishDesign;
  public state: SwimmingFishState;
  private aquariumWidth: number;
  private aquariumHeight: number;
  private maxSpeed: number;
  private changeDirectionChance: number;
  private lastDirectionChange: number;
  private rippleChaseSpeed: number;  // 波紋追跡時の速度倍率

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
    this.rippleChaseSpeed = 1.5 + Math.random() * 0.5; // 波紋追跡時は1.5-2.0倍速
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
      isVisible: true,
      isChasing: false,
      chasingRippleId: undefined,
      baseSpeed: this.maxSpeed
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

    // 波紋追跡中の特別処理
    if (this.state.isChasing) {
      // 波紋に到達した場合は通常状態に戻る
      if (distance < 40) {
        this.state.isChasing = false;
        this.state.chasingRippleId = undefined;
        this.setRandomTarget();
        return;
      }
    } else {
      // 通常状態で目標に近づいた場合、新しい目標を設定
      if (distance < 30) {
        this.setRandomTarget();
        return;
      }
    }

    // 現在の最大速度を決定（波紋追跡中は速度アップ）
    const currentMaxSpeed = this.state.isChasing ? this.state.baseSpeed * this.rippleChaseSpeed : this.maxSpeed;

    // 目標に向かう力
    const forceMultiplier = this.state.isChasing ? 0.15 : 0.1; // 波紋追跡時は強い力
    const targetForceX = (dx / distance) * currentMaxSpeed * forceMultiplier;
    const targetForceY = (dy / distance) * currentMaxSpeed * forceMultiplier;

    // 慣性を保持しつつ目標に向かう
    const damping = this.state.isChasing ? 0.9 : 0.95; // 波紋追跡時は慣性を弱める
    this.state.vx = this.state.vx * damping + targetForceX;
    this.state.vy = this.state.vy * damping + targetForceY;

    // 速度制限
    const currentSpeed = Math.sqrt(this.state.vx * this.state.vx + this.state.vy * this.state.vy);
    if (currentSpeed > currentMaxSpeed) {
      this.state.vx = (this.state.vx / currentSpeed) * currentMaxSpeed;
      this.state.vy = (this.state.vy / currentSpeed) * currentMaxSpeed;
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

  // 波紋を感知して追跡開始
  public detectAndChaseRipple(ripples: Ripple[]): void {
    // 既に追跡中の場合は何もしない
    if (this.state.isChasing) return;

    // 近くの波紋を探す
    let closestRipple: Ripple | null = null;
    let closestDistance = Infinity;
    const detectionRadius = 120; // 感知範囲

    for (const ripple of ripples) {
      if (!ripple.isActive) continue;
      
      const dx = ripple.x - this.state.x;
      const dy = ripple.y - this.state.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 感知範囲内で最も近い波紋を選択
      if (distance < detectionRadius && distance < closestDistance) {
        closestRipple = ripple;
        closestDistance = distance;
      }
    }

    // 波紋が見つかった場合、追跡開始
    if (closestRipple) {
      this.state.isChasing = true;
      this.state.chasingRippleId = closestRipple.id;
      this.state.targetX = closestRipple.x;
      this.state.targetY = closestRipple.y;
    }
  }

  // 追跡中の波紋が消失した場合の処理
  public checkChasingRipple(ripples: Ripple[]): void {
    if (!this.state.isChasing || !this.state.chasingRippleId) return;
    
    const chasingRipple = ripples.find(r => r.id === this.state.chasingRippleId && r.isActive);
    if (!chasingRipple) {
      // 追跡中の波紋が消失した場合、通常状態に戻る
      this.state.isChasing = false;
      this.state.chasingRippleId = undefined;
      this.setRandomTarget();
    } else {
      // 波紋の位置を更新
      this.state.targetX = chasingRipple.x;
      this.state.targetY = chasingRipple.y;
    }
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