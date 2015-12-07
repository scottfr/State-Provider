# State Provider

State Provider is a small library that makes it easy to track the state of an object in order to implement things like undo/redo systems.

# Usage

Create a state provider (your project may have multiple state providers):

> var sp = new StatProvider();

Add an existing object to the state provider:

> var data = {title: "My Book", cost: 100};
>
> dataTracked = sp.add(data);

When data is modified now, a record of the changes made to it will be made:

> dataTracked.title = "A New Book";

You can use the StateProvider.undo(), redo() and restore() functions to access this record:

> dataTracked.title; # = "A New Book"
>
> sp.undo();
>
> dataTracked.title; # = "My Book"
>
> sp.redo();
>
> dataTracked.title; # = "A New Book"

# Compatibility

State Provider uses Proxies which are an ECMAScript 6 feature. At this point, only Firefox supports proxies. Other browsers should be adding them soon.
