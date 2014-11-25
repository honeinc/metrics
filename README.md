# Metrics.js

Metrics.js is a simple script that will log events to [Hone's](http://gohone.com) server as well as [Mixpanel's](https://mixpanel.com). It is written with some ES6 features so it needs to compiled using [es6ify](https://github.com/thlorenz/es6ify).

## Usage

Right now it is small and will hopefully be inlined so no queueing is setup, but it can be used in sync form

```html
<script src="/path-to/metrics.min.js"></script>
```

Then we need to initialize metrics with the keys using

### Metrics::init

- params
  - options { Object }
    - options.domain { String } - domain to log events to 
    - options.mixpanel { String } - mixpanel api key

```javascript
metrics.init( {
    domain: 'http://localhost:8000',
    mixpanel: 'FOOBARBAZQUX'
} );

```

To track an event

### Metrics::track

- params 
    - eventName { String } - Event name
    - meta { Object } - An Object with meta data about event

```javascript
metrics.track( 'foo' , { 
    bar: 'baz',
    qux: 'foo'
} );
```

To identify a user

### Metrics::identify

- params 
    - identity { Object } - An Object with id and email of a user
        - identity.id { String } - An unique identifier
        - identity.email { String } - The users email

> This fires both mixpanel.identify & mixpanel.name_tag

```javascript
metrics.identify( { 
    id: 'foobar', // goes to mixpanel.identify
    email: 'baz@qux.bar' // goes to mixpanel.name_tag
} );
```

To register a user

### Metrics::register

- params 
    - user { Object } - An Object with user information to register with mixpanel

> This only fires an event to mixpanel since we should already have the user in our systems

```javascript
metrics.register( { User } );
```

