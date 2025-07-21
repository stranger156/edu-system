import { watch, nextTick } from 'vue';

// 模块级变量，确保初始化逻辑只运行一次
let isMathJaxLoaded = false;
let mathjaxPromise = null;

 function initializeMathJax() {
    if (isMathJaxLoaded) {
        return mathjaxPromise;
    }
    
    // 设置一个全局标志，防止任何形式的重复执行
    isMathJaxLoaded = true;

    mathjaxPromise = new Promise((resolve, reject) => {
        // **步骤 1: 设置全局配置**
        // MathJax 会在加载时寻找这个全局对象
        window.MathJax = {
            tex: {
                inlineMath: [['\\(', '\\)']],
                displayMath: [['\\[', '\\]']],
                packages: { '[+]': ['cases'] }
            },
            svg: {
                fontCache: 'global'
            },
            startup: {
                // **步骤 2: 当 MathJax 核心准备好时，resolve promise**
                // 这样我们就可以在后续操作中安全地使用 MathJax 对象了
                ready: () => {
                    console.log('MathJax Core is ready.');
                    // 调用 defaultReady 是标准流程的一部分
                    window.MathJax.startup.defaultReady();
                    resolve(window.MathJax);
                }
            }
        };

        // **步骤 3: 动态加载脚本**
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-mml-chtml.js';
        script.async = true;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return mathjaxPromise;
}

export function useMathJax(sourceRef) {
    // 确保初始化函数被调用
    initializeMathJax();

    const typeset = async () => {
        await nextTick();
        try {
            const MathJax = await mathjaxPromise;
            // typesetPromise 是在 defaultReady 之后才可用的
            await MathJax.typesetPromise();
        } catch (e) {
            console.error('MathJax rendering failed:', e);
        }
    };

    // 监听数据源变化
    watch(sourceRef, (newValue) => {
        if(newValue) { // 只在有数据时才触发
            typeset();
        }
    }, { deep: true, immediate: true });
}