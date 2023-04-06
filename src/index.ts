import { StyleProperties, resolveEasing, resolveStyles } from './cores/animation'

export type AnimationProps = {
    duration: number;
    styles: StyleProperties;
    easing: string;
}

/**
 * 元素动画
 * @param el DOM元素
 * @param props 动画属性
 */
export function animate(el: HTMLElement, props: AnimationProps): { pause: () => void } {
    const duration = props.duration;
    const easingFunc = resolveEasing(props.easing);
    const styleFuncs = resolveStyles(el, props.styles);

    const cAniInstance = {
        paused: false,
    }

    const start = Date.now();
    const animationHandle = () => {
        if (cAniInstance.paused) {
            return;
        }
        const timeRatio = (Date.now() - start) / duration;
        if (timeRatio <= 1) {
            const percent = easingFunc(timeRatio);
            for (const key in styleFuncs) {
                const elementStyle = el.style as any;
                elementStyle[key] = styleFuncs[key](percent);
            }
            requestAnimationFrame(animationHandle);
        }
    }
    requestAnimationFrame(animationHandle);

    return {
        pause: () => {
            cAniInstance.paused = true;
        }
    }
}