import { useEffect, useState , useRef } from 'react';
import React from 'react';
import Layout from '../../components/Layout/Layout';
import '../../styles/Home.css'
import back from '/images/background.png'


// 商品データの型定義
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  emoji: string; 
}

const products: Product[] = [
  {
    id: 'tutorial1',
    name: 'オリジナル作成',
    price: 2500,
    description: '1. ベースの体型（Base）を選ぶ\n丸型、細長型などから金魚の基本形状を選べます。\n2. パーツのデザイン\n背ビレ・胸ビレ・尾ビレ・目・口・ウロコ をそれぞれ選んで変更できます。\n3. 色のカスタマイズ\n体の色・ヒレの色・目の色を自由に設定できます。\n4. サイズ・位置の調整\nヒレや目の大きさ・位置を微調整できます。よりリアルな配置にするために使いましょう。',
    images: [
      '/images/tutorial1.mp4',
    ],
     emoji: '🐠', 
  },
  {
    id: 'cuenco-hondo-blu',
    name: 'AI作成',
    price: 2800,
    description: '1. モデル選択（ChatGPT または Gemini）\nどちらのAIを使って金魚を生成するかを選びます。\n2. 基本設定\n体の形、色、サイズを選んでベースを選びます。\n3. 詳細設定\nひれの種類、目の形、模様、模様なし・ストライプ・斑点などから選びます。\n4. アクセサリー\nリボン、王冠、メガネ、スカーフ などの頭、顔、首に付けるアクセサリーを選べます。\n5. 生成＆カスタム\n自由な説明文を追加し、生成ボタンをクリックするとAIが画像を生成します。',
    images: [
      '/images/cuenco-hondo-blu-main.png',
      '/images/cuenco-hondo-blu-thumb1.png',
      '/images/cuenco-hondo-blu-thumb2.png',
    ],
     emoji: '🤖', 
  },
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [mainImage, setMainImage] = useState<string>(selectedProduct.images[0]);

  const headerRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLImageElement>(null);

  const descriptionLines = selectedProduct.description.split('\n');

  useEffect(() => {
    const section = document.querySelector('.bubble-background');
    if (!section) return;

    const createBubble = () => {
      const bubbleEl = document.createElement('span');
      bubbleEl.className = 'bubble';
      const minSize = 10;
      const maxSize = 50;
      const size = Math.random() * (maxSize + 1 - minSize) + minSize;
      bubbleEl.style.width = `${size}px`;
      bubbleEl.style.height = `${size}px`;
      bubbleEl.style.left = Math.random() * window.innerWidth + 'px';
      section.appendChild(bubbleEl);

      setTimeout(() => {
        bubbleEl.remove();
      }, 8000);
    };

    let activeBubble: number | null = null;

    const stopBubble = () => {
      if (activeBubble !== null) {
        clearInterval(activeBubble);
      }
    };

    const cb = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeBubble = window.setInterval(createBubble, 300);
        } else {
          stopBubble();
        }
      });
    };

    const options = {
      rootMargin: '100px 0px',
    };

    const io = new IntersectionObserver(cb, options);
    io.observe(section);

    return () => {
      io.disconnect();
      stopBubble();
    };
  }, []);


  return (
    <Layout>
      <div className="home-page">
        <img src={back} alt="back" className="back" ref={backRef} />
        <div className="bubble-background">
          <figure>
            <h1 style={{ fontSize: '80px' }}>Uo/Code</h1>
            <img src="/images/back1.png" alt="back1" className="back1" />
            <img src="/images/back2.png" alt="back2" className="back2" />
            <img src="/images/back3.png" alt="back3" className="back3" />
            <img src="/images/back4.png" alt="back4" className="back4" />
          </figure>
        </div>
        <div className="custom-shape-divider-bottom-1754192383">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
          </svg>
        </div>
        
        <main id="m-index">
          <div className='product-display-container'>
            {/* 左側のサイドバー */}
            <aside className='product-sidebar'>
              <h2 className='sidebar-title' style={{ fontSize: '55px' }}>Tutorial</h2>
              <span className='sidebar-subtitle'>チュートリアル</span>
              <ul className='product-list'>
                {products.map((product) => (
                  <li
                    key={product.id}
                    className={`product-item ${selectedProduct.id === product.id ? 'active' : ''}`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className='product-thumb-text'>{product.name}</div>
                    {/* <img src={product.images[0]} alt={product.name} className='product-thumb-image' /> */}
                    <span className='product-thumb-emoji'>{product.emoji}</span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* 右側のコンテンツ */}
            <div className='product-content'>
              <div className='main-product-display'>
                <video autoPlay loop muted playsInline src={mainImage} className='main-product-image' />
              </div>

              <div className='product-details'>
                <h3>{selectedProduct.name}</h3>
                {/* <p className='product-description'>{selectedProduct.description}</p> */}
                <div style={{ textAlign: 'left'}}>
                  {descriptionLines.map((line, index) => (
                  <span key={index} style={{ fontWeight: index === 0 || index === 2|| index === 4|| index === 6|| index === 8 ? 'bold' : 'normal',display: 'block',
                  marginBottom: '4px',
                  marginLeft: '170px', lineHeight:'2' }}>
                  {line}
                  <br />
                  </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}