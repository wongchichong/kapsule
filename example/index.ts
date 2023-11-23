import Kapsule from '../src/index'
import { $, $$, useEffect } from 'woby'

// Define component

const color = $('blue')
const text = $('foo')
const ColoredText = Kapsule({

    props: {
        color: { default: color },
        text: { default: text }
    },

    init(domElement, state) {
        state.elem = document.createElement('span')
        domElement.appendChild(state.elem)
    },

    update(state, changedProps) {
        console.log('Changed Props:', Object.assign({}, ...Object.entries(changedProps).map(([prop, prevVal]) => ({ [prop]: { prevVal, newVal: state[prop] } }))))

        useEffect(() => {
            state.elem.style.color = $$(state.color)
            state.elem.textContent = $$(state.text)
        })
    }

})

// Instantiate
const myText = ColoredText()


// Render
myText(document.body)
    .color(color)
    .text(text)

setTimeout(() => {
    // myText.color('orange')
    //     .text('bar')

    color('orange')
    text('bar')
}, 2000)
