# State Provider

State Provider is a small library that makes it easy to track the state of an object in order to implement things like undo/redo systems.

# Usage

Create a state provider (your project may have multiple state providers):

> var sp = new StateProvider();

Add an existing object to the state provider (you can add as many objects as you want to a state provider):

> var data = {title: "My Book", cost: 100};
>
> var dataTracked = sp.add(data);

When the tracked objects are modified, a record of the changes made to them will automatically be saved in the state provider:

> dataTracked.title = "A New Book";

You can use the state provider's undo(), redo() and restore() functions to access this record:

> dataTracked.title; // = "A New Book"
>
> sp.undo();
>
> dataTracked.title; // = "My Book"
>
> sp.redo();
>
> dataTracked.title; // = "A New Book"

The demo.html file illustrates the usage of this library in combination with a two-way data binding library.

# Time Function

The timeFunction property on the State Provider config object lets you determine how changes are batched together. If you change the function to something that has a 1-minute resolution, for instance, all changes in a given minute will be batched together.

# Compatibility

State Provider uses Proxies which are an ECMAScript 6 feature. At this point, only Firefox supports proxies. Other browsers should be adding them soon.
