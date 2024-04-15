import debounce from 'lodash-es/debounce.js'

interface PropOptions<T, S> {
    default?: T
    triggerUpdate?: boolean
    onChange?: (newVal: T, state: S) => void
}

class Prop<T, S> {
    defaultVal: T
    triggerUpdate: boolean
    onChange: (newVal: any, state: S) => void
    constructor(public name: string, {
        default: defaultVal = null,
        triggerUpdate = true,
        onChange = (newVal, state) => { }
    }: PropOptions<T, S>) {
        this.name = name
        this.defaultVal = defaultVal
        this.triggerUpdate = triggerUpdate
        this.onChange = onChange
    }
}

type State<T extends Record<string, PropOptions<any, any>>> = {
    [K in keyof T]: T[K]['default']
} & { elem: HTMLElement, initialised?: boolean }

export type Chainable<T extends Record<string, PropOptions<any, any>>> = {
    [K in keyof T]: (value: T[K]['default']) => Chainable<T>
}

// const a = {
//     color: { default: 'red' },
//     text: { default: '' }
// }


// const aa: Chainable<typeof a>
// aa.v


export function Kapsule<P extends Record<string, PropOptions<any, any>>>({
    stateInit = ((o) => ({} as P)),
    props: rawProps = {} as P,
    methods = {},
    aliases = {},
    init: initFn = ((a, b, c) => { }),
    update: updateFn = ((a: State<P>, b: State<P>) => { })
}: {
    stateInit?: (o) => P,
    props?: P,
    methods?: any,
    aliases?: any,
    init?: (a, b, c) => void,
    update?: (a: State<P>, b: State<P>) => void
}) {

    // Parse props into Prop instances
    const props = Object.keys(rawProps).map(propName =>
        new Prop(propName, rawProps[propName])
    )

    return function (options = {}) {

        // Holds component state
        let state = Object.assign({} as State<P>,
            stateInit instanceof Function ? stateInit(options) : stateInit, // Support plain objects for backwards compatibility
            { initialised: false }
        )

        // keeps track of which props triggered an update
        let changedProps = {} as State<P>

        // Component constructor
        function comp(nodeElement) {
            initStatic(nodeElement, options)
            digest()

            return comp as Chainable<P>
        }

        const initStatic = function (nodeElement, options) {
            initFn.call(comp, nodeElement, state, options)
            state.initialised = true
        }

        const digest = debounce(() => {
            if (!state.initialised) { return }
            updateFn.call(comp, state, changedProps)
            changedProps = {} as State<P>
        }, 1)

        // Getter/setter methods
        props.forEach(prop => {
            comp[prop.name] = getSetProp(prop)

            function getSetProp({
                name: prop,
                triggerUpdate: redigest = false,
                onChange = (newVal, state, curVal) => { },
                defaultVal = null
            }) {
                return function (_) {
                    const curVal = state[prop]
                    if (!arguments.length) { return curVal } // Getter mode

                    const val = _ === undefined ? defaultVal : _ // pick default if value passed is undefined
                        ; (state as any)[prop] = val
                    onChange.call(comp, val, state, curVal)

                    // track changed props
                    !changedProps.hasOwnProperty(prop) && ((changedProps as any)[prop] = curVal)

                    if (redigest) { digest() }
                    return comp
                }
            }
        })

        // Other methods
        Object.keys(methods).forEach(methodName => {
            comp[methodName] = (...args) => methods[methodName].call(comp, state, ...args)
        })

        // Link aliases
        Object.entries(aliases).forEach(([alias, target]) => comp[alias] = comp[target as any])

        // Reset all component props to their default value
        comp.resetProps = function () {
            props.forEach(prop => {
                comp[prop.name](prop.defaultVal)
            })
            return comp
        }

        //

        comp.resetProps() // Apply all prop defaults
        //@ts-ignore
        state._rerender = digest // Expose digest method

        return comp as typeof comp & Chainable<P>
    }
}
