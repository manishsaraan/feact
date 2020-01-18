// This class handles the dom changes
class FeactDomComponent {
    constructor(element){
        this._element = element;
    }

    // this method will render the passed element into the given dom
    mountComponent(container){
      const domElement = document.createElement(this._element.type);
      const textNode = document.createTextNode(this._element.props.children);

      domElement.appendChild(textNode);
      container.appendChild(domElement);

      this._hostNode = domElement;

      return domElement;
    }
}

// This class wrappes the user componet or primitive element
// and call FeactDomComponent to render the elements in dom
class FeactCompositeComponentWrapper {
    constructor(element){
        this._currentElement = element;
    }

    // get element and its props and pass it to FeactDomComponent
    mountComponent(container){

      // get the wrapped class
      const Component = this._currentElement.type;

      // call the wrapped class
      const componentInstance = new Component(this._currentElement.props)
      
      // get the props of wrapped element
      let element = componentInstance.render()

      // if passed element is a custom component, get its type and props
      while(typeof element.type === 'function'){
         element = (new element.type(element.props)).render();
      }
    
      // pass element type and props into FeactDomComponent to render in the DOM
      const domComponentInstance = new FeactDomComponent(element);

      return domComponentInstance.mountComponent(container);
    }
}


// This is a temp class to wrap primitive or component element so that FeactCompositeComponentWrapper can use both
const TopLevelWrapper = function(props){
    this.props = props;
}

TopLevelWrapper.prototype.render = function(){
    return this.props;
}

const Feact = {
    // Adding custom component capability
    createClass(spec){
        // This is going to be exicuted by FeactCompositeComponentWrapper's mountComponent method
       function Constructor(props){
           this.props = props;
       }

       Constructor.prototype.render = spec.render;

       return Constructor;
    },
    // it will return type of element with props to be used by FeactDomComponent's mountComponent
    createElement(type, props, children){
        const element = {
            type,
            props: props || {}
        }

        if(children){
            element.props.children = children;
        }

        return element;
    },
    
    // render passed element into the dom
    render(element, container){
       // wrap passed element into TopLevelWrapper
       const wrapperElement = this.createElement(TopLevelWrapper, element);

       const componentInstance = new FeactCompositeComponentWrapper(wrapperElement);

       return componentInstance.mountComponent(container);
    }
}

const myH1 = Feact.createClass({
    render(){
        return Feact.createElement("h1", null, "This is Heading")
    }
});

// Custom Component
const myTitle = Feact.createClass({
    render(){
        return Feact.createElement("h1", null, this.props.message)
    }
})

const MyMessage = Feact.createClass({
    render() {
        if (this.props.asTitle) {
            return Feact.createElement(MyTitle, {
                message: this.props.message
            });
        } else {
            return Feact.createElement('p', null, this.props.message);
        }
    }
});

// render the app
Feact.render(
    Feact.createElement(myTitle, { message: 'Hello There!'}),
    document.getElementById("root1")
)

// // render the app
Feact.render(
    Feact.createElement("button", {}, "This is primitive element"),
    document.getElementById("root2")
)

// // render the app
Feact.render(
    Feact.createElement(myH1),
    document.getElementById("root2")
)