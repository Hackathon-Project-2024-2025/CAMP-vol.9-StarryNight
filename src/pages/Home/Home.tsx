// import { useState } from 'react'
import { useEffect } from 'react';
import '../../styles/reset.css'
import '../../styles/Home.css'
import back from '/images/background.png'

function Home() {
  // const [count, setCount] = useState(0)

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
        activeBubble = window.setInterval(createBubble, 300); // setInterval の型も安全に
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
    <>
    <header>
      <div className="bubble-background">
      <figure>
        <h1>SAMPLE</h1>
        <img src={back} alt="back" className="back" />
        <img src="/images/back1.png" alt="back1" className="back1" />
        <img src="/images/back2.png" alt="back2" className="back2" />
        <img src="/images/back3.png" alt="back3" className="back3" />
        <img src="/images/back4.png" alt="back4" className="back4" />
      </figure>
      </div>
    </header>

    <main id="m-index">

    </main>
    </>
  );
};

export default Home;