# email-provider

Return the email provider for a given email address.

## Installation

```sh
$ npm install bredele/email-provider
```

## Usage

```ts
import provider from "email-provider";

await provider("hello@gmail.com");
// => 'gmail'

await provider("hello@something-random.com");
// => 'unknown
```

## Providers

This module supports the following provider:

- gmail
- outlook
- yahoo
- zoho
- protonmail
- icloud
- fastmail
