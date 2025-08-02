import type { Ripple } from '../../../types/common.types';
import type { AIFishImage } from '../../../services/storage/localStorage';

export interface SwimmingAIFishState {
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

export class SwimmingAIFish {
  public aiFishImage: AIFishImage;
  public state: SwimmingAIFishState;
  private aquariumWidth: number;
  private aquariumHeight: number;
  private maxSpeed: number;
  private changeDirectionChance: number;
  private lastDirectionChange: number;
  private rippleChaseSpeed: number;  // 波紋追跡時の速度倍率
  public domElement: HTMLElement;   // DOM要素への参照
  private hasLoggedFirstPosition: boolean = false;  // 初回位置ログフラグ
  private hasLoggedFirstUpdate: boolean = false;    // 初回更新ログフラグ
  public hasLoggedVisibility: boolean = false;      // 可視性ログフラグ（Aquarium.tsxからアクセス）
  private isFixedPositionTest: boolean = true;      // 固定位置テストモード（デバッグ用）

  constructor(
    aiFishImage: AIFishImage, 
    aquariumWidth: number, 
    aquariumHeight: number,
    containerElement: HTMLElement
  ) {
    this.aiFishImage = aiFishImage;
    this.aquariumWidth = aquariumWidth;
    this.aquariumHeight = aquariumHeight;
    
    // 魚ごとに異なる速度と行動パターンを設定
    this.maxSpeed = 0.8 + Math.random() * 1.2; // 0.8-2.0の速度（AI魚は少し速め）
    this.rippleChaseSpeed = 1.8 + Math.random() * 0.7; // 波紋追跡時は1.8-2.5倍速
    this.changeDirectionChance = 0.0025 + Math.random() * 0.0035; // 方向転換確率
    this.lastDirectionChange = Date.now();

    // 初期位置をランダムに設定
    this.state = {
      x: Math.random() * (aquariumWidth - 120) + 60,
      y: Math.random() * (aquariumHeight - 120) + 60,
      vx: (Math.random() - 0.5) * this.maxSpeed,
      vy: (Math.random() - 0.5) * this.maxSpeed,
      targetX: 0,
      targetY: 0,
      angle: 0,
      scale: 0.7 + Math.random() * 0.5, // 0.7-1.2のスケール
      isVisible: true,
      isChasing: false,
      chasingRippleId: undefined,
      baseSpeed: this.maxSpeed
    };

    // DOM要素を作成
    this.domElement = this.createDOMElement(containerElement);
    this.setRandomTarget();
    
    // DOM初期化の強制実行（複数回実行で確実に設定）
    this.forceInitializeDOMState();
  }

  private createDOMElement(containerElement: HTMLElement): HTMLElement {
    console.log(`🐠 Creating DOM element for AI fish: ${this.aiFishImage.name}`);
    
    // Container要素の詳細情報を確認
    const containerRect = containerElement.getBoundingClientRect();
    const containerComputed = getComputedStyle(containerElement);
    console.log(`📦 Container element analysis:`);
    console.log(`   - tagName: ${containerElement.tagName}`);
    console.log(`   - className: ${containerElement.className}`);
    console.log(`   - getBoundingClientRect: ${Math.round(containerRect.x)}, ${Math.round(containerRect.y)} (${Math.round(containerRect.width)}x${Math.round(containerRect.height)})`);
    console.log(`   - computed position: ${containerComputed.position}`);
    console.log(`   - computed display: ${containerComputed.display}`);
    console.log(`   - computed visibility: ${containerComputed.visibility}`);
    console.log(`   - computed overflow: ${containerComputed.overflow}`);
    console.log(`   - children count: ${containerElement.children.length}`);
    
    const fishContainer = document.createElement('div');
    fishContainer.className = 'swimming-ai-fish';
    fishContainer.style.cssText = `
      position: absolute;
      width: 80px;
      height: 60px;
      z-index: 1000;
      pointer-events: none;
      transition: none;
      border: 2px solid red;
      background-color: rgba(255, 0, 0, 0.2);
      visibility: visible;
      opacity: 1;
      display: block;
    `;

    const fishImage = document.createElement('img');
    
    // Base64データから画像形式を自動判定
    const imageFormat = this.detectImageFormat(this.aiFishImage.imageData);
    fishImage.src = `data:image/${imageFormat};base64,${this.aiFishImage.imageData}`;
    fishImage.alt = this.aiFishImage.name;
    
    console.log(`📸 Setting image source: data:image/${imageFormat};base64,[${this.aiFishImage.imageData.length} chars]`);
    
    fishImage.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      border: 1px solid blue;
      background-color: rgba(0, 0, 255, 0.1);
    `;

    // 画像読み込み成功・失敗のハンドリング
    fishImage.onload = () => {
      console.log(`✅ AI fish image loaded successfully: ${this.aiFishImage.name}`);
    };
    
    fishImage.onerror = (error) => {
      console.error(`❌ Failed to load AI fish image: ${this.aiFishImage.name}`, error);
      console.error(`🔍 Image data preview: ${this.aiFishImage.imageData.substring(0, 100)}...`);
    };

    fishContainer.appendChild(fishImage);
    
    // 緊急回避策: Containerに問題がある場合はdocument.bodyに直接append
    if (containerRect.width === 0 || containerRect.height === 0) {
      console.warn(`⚠️ Container has zero dimensions, appending to document.body as fallback`);
      document.body.appendChild(fishContainer);
      
      // bodyに追加した場合はビューポート基準の絶対位置に調整
      fishContainer.style.position = 'fixed';
      fishContainer.style.top = '100px';
      fishContainer.style.left = '100px';
      console.log(`🆘 AI fish appended to document.body as emergency fallback`);
    } else {
      containerElement.appendChild(fishContainer);
      console.log(`✅ AI fish appended to normal container`);
    }
    
    console.log(`🎯 AI fish DOM element created and added`);
    console.log(`📐 Container position: ${containerElement.style.position || 'static'}`);
    console.log(`🏗️ Container children count: ${containerElement.children.length}`);
    console.log(`🎨 Fish container z-index: ${fishContainer.style.zIndex}`);
    
    // 5秒後に要素の実際の位置情報を表示
    setTimeout(() => {
      const rect = fishContainer.getBoundingClientRect();
      console.log(`📏 AI fish actual position after 5s: ${this.aiFishImage.name}`);
      console.log(`   - getBoundingClientRect: ${Math.round(rect.x)}, ${Math.round(rect.y)} (${Math.round(rect.width)}x${Math.round(rect.height)})`);
      console.log(`   - style.transform: ${fishContainer.style.transform}`);
      console.log(`   - visibility: ${getComputedStyle(fishContainer).visibility}`);
      console.log(`   - opacity: ${getComputedStyle(fishContainer).opacity}`);
    }, 5000);
    
    return fishContainer;
  }

  /**
   * Base64データから画像形式を自動判定
   */
  private detectImageFormat(base64Data: string): string {
    // Base64データの先頭文字から画像形式を判定
    if (base64Data.startsWith('/9j/')) {
      // JPEG形式の特徴的な開始バイト
      return 'jpeg';
    } else if (base64Data.startsWith('iVBORw0KGgo')) {
      // PNG形式の特徴的な開始バイト
      return 'png';
    } else if (base64Data.startsWith('R0lGOD')) {
      // GIF形式の特徴的な開始バイト
      return 'gif';
    } else if (base64Data.startsWith('UklGR')) {
      // WebP形式の特徴的な開始バイト
      return 'webp';
    } else {
      // 判定できない場合はJPEGとしてフォールバック（圧縮処理でJPEGを使用しているため）
      console.warn(`⚠️ Could not detect image format, defaulting to JPEG. Data starts with: ${base64Data.substring(0, 20)}`);
      return 'jpeg';
    }
  }

  /**
   * DOM状態の強制初期化
   */
  private forceInitializeDOMState(): void {
    console.log(`🔧 Force initializing DOM state for: ${this.aiFishImage.name}`);
    
    // 1回目: 即座に位置を設定
    this.updateDOMPosition();
    
    // 2回目: requestAnimationFrameで確実にDOM準備完了後に実行
    requestAnimationFrame(() => {
      console.log(`🔧 Second DOM initialization for: ${this.aiFishImage.name}`);
      this.updateDOMPosition();
      
      // 3回目: さらに遅延して確実に
      setTimeout(() => {
        console.log(`🔧 Final DOM initialization for: ${this.aiFishImage.name}`);
        this.updateDOMPosition();
        
        // 初期化完了後の状態確認
        const rect = this.domElement.getBoundingClientRect();
        console.log(`📊 Post-initialization check: ${this.aiFishImage.name}`);
        console.log(`   - getBoundingClientRect: ${Math.round(rect.x)}, ${Math.round(rect.y)} (${Math.round(rect.width)}x${Math.round(rect.height)})`);
        console.log(`   - style.transform: ${this.domElement.style.transform}`);
        console.log(`   - computed visibility: ${getComputedStyle(this.domElement).visibility}`);
        console.log(`   - computed opacity: ${getComputedStyle(this.domElement).opacity}`);
      }, 100);
    });
  }

  private setRandomTarget(): void {
    const margin = 100;
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
      if (distance < 50) {
        this.state.isChasing = false;
        this.state.chasingRippleId = undefined;
        this.setRandomTarget();
        return;
      }
    } else {
      // 通常状態で目標に近づいた場合、新しい目標を設定
      if (distance < 40) {
        this.setRandomTarget();
        return;
      }
    }

    // 現在の最大速度を決定（波紋追跡中は速度アップ）
    const currentMaxSpeed = this.state.isChasing ? this.state.baseSpeed * this.rippleChaseSpeed : this.maxSpeed;

    // 目標に向かう力
    const forceMultiplier = this.state.isChasing ? 0.18 : 0.12; // 波紋追跡時は強い力
    const targetForceX = (dx / distance) * currentMaxSpeed * forceMultiplier;
    const targetForceY = (dy / distance) * currentMaxSpeed * forceMultiplier;

    // 慣性を保持しつつ目標に向かう
    const damping = this.state.isChasing ? 0.88 : 0.93; // 波紋追跡時は慣性を弱める
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
    const margin = 60;

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
    
    // 最低1.2秒間は同じ方向を維持（AI魚は少し長め）
    if (now - this.lastDirectionChange < 1200) {
      return;
    }

    if (Math.random() < this.changeDirectionChance) {
      this.setRandomTarget();
      this.lastDirectionChange = now;
    }
  }

  private updateDOMPosition(): void {
    if (!this.domElement) {
      console.error(`❌ DOM element not found for AI fish: ${this.aiFishImage.name}`);
      return;
    }

    // 魚の向きを判定（左向きかどうか）
    const isMovingLeft = Math.cos(this.state.angle) < 0;
    
    // CSS Transform でアニメーション
    const scaleX = isMovingLeft ? -this.state.scale : this.state.scale;
    const rotation = isMovingLeft ? -(this.state.angle * 180 / Math.PI) : (this.state.angle * 180 / Math.PI);
    
    const transformStyle = `translate(${this.state.x - 40}px, ${this.state.y - 30}px) rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${this.state.scale})`;
    
    this.domElement.style.transform = transformStyle;
    this.domElement.style.opacity = this.state.isVisible ? '1' : '0';
    
    // 初回位置更新時のみデバッグログ
    if (!this.hasLoggedFirstPosition) {
      console.log(`🎯 AI fish first position update: ${this.aiFishImage.name} at (${Math.round(this.state.x)}, ${Math.round(this.state.y)})`);
      console.log(`🔄 Transform: ${transformStyle}`);
      this.hasLoggedFirstPosition = true;
    }
  }

  public update(): void {
    // 初回更新時のみデバッグログ
    if (!this.hasLoggedFirstUpdate) {
      console.log(`🔄 Starting AI fish update loop: ${this.aiFishImage.name}`);
      console.log(`📍 Initial position: (${Math.round(this.state.x)}, ${Math.round(this.state.y)})`);
      console.log(`🎯 Initial target: (${Math.round(this.state.targetX)}, ${Math.round(this.state.targetY)})`);
      this.hasLoggedFirstUpdate = true;
    }
    
    // 一時的な固定位置テスト（デバッグ用）
    if (this.isFixedPositionTest) {
      // アニメーションを停止して固定位置に配置
      this.state.x = 200 + (Math.random() * 400); // 200-600の範囲で固定
      this.state.y = 150 + (Math.random() * 300); // 150-450の範囲で固定
      this.state.vx = 0;
      this.state.vy = 0;
      this.state.angle = 0;
      this.updateDOMPosition();
      return; // アニメーション処理をスキップ
    }
    
    // ランダムな方向転換
    this.randomDirectionChange();
    
    // 速度更新
    this.updateVelocity();
    
    // 位置更新
    this.state.x += this.state.vx;
    this.state.y += this.state.vy;
    
    // 境界処理
    this.handleBoundaryCollision();
    
    // DOM位置更新
    this.updateDOMPosition();
  }

  public setVisibility(visible: boolean): void {
    this.state.isVisible = visible;
    this.updateDOMPosition();
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
    const detectionRadius = 140; // AI魚の感知範囲は少し広め

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
    
    this.updateDOMPosition();
  }

  public destroy(): void {
    // DOM要素をクリーンアップ
    if (this.domElement && this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }
  }
}