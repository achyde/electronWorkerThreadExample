export {};

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>
    export default component
}
declare global {
    interface Window {
        api: any
    }

    interface FloatTimeEntry {
        val: number
        time: date
    }

    interface XYEntry {
        x: Array<number>
        y: Array<number>
        showlegend?: boolean
        name?: string
    }
}
