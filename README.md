Segment TSD Generator
===

Overview
---

[Segment](https://segment.com)'s [Protocols](https://segment.com/product/protocols) enable users to creating [tracking plans](https://segment.com/academy/collecting-data/how-to-create-a-tracking-plan/) and then govern all events that are sent to Segment to ensure they conform to this tracking plan. This project creates TypeScript definition files from these to give developers strongly typed access to Segment's various JavaScript/TypeScript APIs and SDKs.

Comparison to TypeWriter
---

Segment already has an open-source library called [TypeWriter](https://github.com/segmentio/typewriter) that does something similar (although it also supports the [iOS](https://segment.com/docs/connections/sources/catalog/libraries/mobile/ios/) and [Android](https://segment.com/docs/connections/sources/catalog/libraries/mobile/android/) SDKs; however on the JavaScript/TypeScript front, it is specifically used for Analytics JS). TypeWriter takes a different approach to this project. TypeWriter creates helper functions, where-as this project merely creates TypeScript definitions that fit over the "vanilla" calls of e.g. the [Analytics JS](https://github.com/segmentio/analytics.js/) SDK.

Reasons to use TypeWriter

 * You want typing definitions for the iOS and Android SDKS
 * You want to use convenience methods for Analytics JS rather than make calls against the raw API

Reasons to use Segment TSD Generator

 * You have already used the raw Analytics JS methods and want to retrofit Types over the top of your existing code
 * You want to use the typings for Node JS calling against the [HTTP Tracking API](https://segment.com/docs/connections/sources/catalog/libraries/server/http-api/), or in [Custom Sources](https://segment.com/docs/connections/sources/custom-sources/) or [Custom Destinations](https://segment.com/docs/connections/destinations/custom-destinations/). For this use-case, you may also consider using [Segment TypeScript Definitions](https://github.com/christyharagan/segment-typescript-definitions), which provide TypeScript definition files for these APIs/environments.

Install
---

 Install via NPM:

```
npm i --save segment-tsd-generator
```

or Yarn:

```
yarn install segment-tsd-generator
```

Example Usage
---

```ts
import {getTrackingPlan} from 'segment-typescript-api/cjs/config-api'
import generator from 'segment-tsd-generator'
import * as fs from 'fs'

let WORKSPACE_TOKEN = '123'
let WORKSPACE_SLUG = 'my-workspace'

getTrackingPlan(WORKSPACE_TOKEN, WORKSPACE_SLUG, 'My Tracking Plan').then(generator).then(tsd=>{
  fs.writeFile('my_tracking_plan.d.ts', tsd, 'utf8', (err) => {
    if (err) {
      console.err(err)
    } else {
      // Do awesome stuff with you definition file
    }
  })
})
```