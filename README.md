# AgnosUI: A Versatile Frontend Widget Library for CSS Bootstrap Design

## Introduction

AgnosUI is a powerful library of widgets designed specifically for the [CSS Bootstrap design](https://getbootstrap.com/). Inspired by the success of [ng-bootstrap](https://ng-bootstrap.github.io/#/home), AgnosUI takes the concept a step further by offering widgets that can seamlessly integrate with any front-end framework of your choice. With support for popular frameworks like [Angular](https://angular.io/), [React](https://react.dev/), and [Svelte](https://svelte.dev/), AgnosUI allows you to effortlessly create consistent and visually appealing UI components across your projects.

## Key Characteristics

1. **Framework Agnostic Widgets**: AgnosUI's widget architecture revolves around a framework-agnostic core. Each widget is implemented in this core, focusing on its model (data) and the methods required to manipulate this data. This abstraction allows developers to create widgets independently of any specific framework, facilitating integration into various projects.

2. **Extensive Framework Support**: AgnosUI currently offers support for three widely-used front-end frameworks: Angular, React, and Svelte. This diverse compatibility ensures that developers can leverage AgnosUI's widgets seamlessly across projects, irrespective of the chosen framework.

3. **Adapters for Each Framework**: To achieve compatibility with different front-end frameworks, each widget in AgnosUI has an adapter for every supported framework. These adapters play a pivotal role in building the widget's UI by:

   - Constructing the appropriate markup based on the core data.
   - Connecting user actions to the corresponding core methods.
   - Listening for any change to the model and automatically triggering re-renders of the markup.

4. **Flexible Widget Customization**: AgnosUI allows developers to configure and override any widget props at any point within the component subtree. This flexibility enables extensive customization possibilities, empowering developers to tailor the widgets to suit their specific project requirements.

5. **Thorough Testing**: The core of AgnosUI undergoes comprehensive unit testing using [Vitest](https://vitest.dev/), ensuring its independence from any specific framework. Additionally, rigorous end-to-end tests are conducted with [Playwright](https://playwright.dev/) across different frameworks and browsers (Chromium, Firefox, Webkit). As the markup remains consistent for all frameworks, these tests are inherently framework-agnostic, guaranteeing robust and reliable widget functionalities.

## Advantages

1. **Consistent User Experience**: AgnosUI's adapter-based approach ensures a uniform user experience across all supported frameworks. Any fix or new feature implemented at the core level automatically propagate to all adapters, minimizing discrepancies between frameworks.

2. **Functionality Assurance**: With a strong focus on testing, AgnosUI guarantees consistent functionalities between frameworks. This assurance is invaluable to developers, as it simplifies development and enables them to create widgets with confidence.

## Getting Started

To start using AgnosUI in your project, follow the instructions in the [Installation Guide](INSTALLATION.md). For detailed documentation on each widget and its usage, refer to the [Documentation](https://amadeusitgroup.github.io/AgnosUI/latest/).

## Contributing

We welcome contributions from the community to make AgnosUI even better. Please read our [Contribution Guidelines](DEVELOPER.md) to get started.

## License

AgnosUI is released under the [MIT License](LICENSE).

---
