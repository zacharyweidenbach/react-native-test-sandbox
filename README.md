# react-native-test-sandbox

Exploring the ease of testing given conventional React architecture patterns, vs MVC style decoupling, vs some other patterns.

## Basic Features

The basic features to implement for each architecture will be:

1. List View
2. Add New Item View
3. Edit View

## Architecture Patterns

- Conventional React patterns
  - use react-query, and other hooks directly in the rendered component
  - No HOC or dependency injection to decouple view layer from business logic
- MVC
  - React controller component that only returns view layer, supplying all necessary data and callbacks via props
  - Utilize a state machine (xstate or something like it) to manage UI state changes and return them back to the view layer

## Testing

Tests will take the form of integration, and unit tests
Integration Tests might include:

- Testing screens as a whole
- Testing navigation behavior between screens
- Gherkin tests driven by Detox or Appium to verify correctness with mocked api (this could be considered e2e if the api was involved)

Unit Tests might include:

- Testing individual low-level UI components
- Testing pure domain or business logic functions
