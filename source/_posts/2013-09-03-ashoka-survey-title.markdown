---
layout: post
title: "Building an offline survey tool for Rural India"
created_at: 2013-09-03 18:21 UTC
comments: true
published: false

---

At Nilenso, we've helped [Ashoka](https://india.ashoka.org/) accomplish their initiative in building infrastructure for the [citizen sector](https://www.ashoka.org/citizensector).

Infiniti is a suite of products envisioned for social entrepreneurs, the fellows at Ashoka and other citizen sector organizations to get a variety of quality data through crowd sourcing, organized surveys and market research.

Field agents responsible for carrying out these surveys face problems where there is often severe lack of proper mobile connectivity and even basic amenities and effectively capture data offline and have it synced once they return back to camp.

![](https://cl.ly/image/012e0D3u2P1k/Image%202013.09.10%208%3A11%3A32%20PM.png)

It is currently very much in use at Ashoka around these verticals:

- Nutrition and Wellness – for addressing malnutrition problem among children in India
- Affordable Housing – for enabling access to housing in the informal sector
- Rural Innovation and Farming – to understand the role of women in Agriculture

This suite is largely composed of these ideas:

![Infiniti Suite](https://cl.ly/image/3u2E0I0M1A0Z/Image%202013.09.05%206_40_04%20PM.png)

As a part of this, we built Ashoka Survey Web – one of the arms that takes care of data collection, validation, integrity and reporting.

## How does Survey Web work?

It is a collection of these 4 applications:

- the auth provider, [user-owner](https://github.com/nilenso/ashoka-user-owner).
- the survey builder, [survey-web](https://github.com/nilenso/ashoka-survey-web) 
- response collection from the web, [survey-web](https://github.com/nilenso/ashoka-survey-web).
- the mobile applications:
  [survey-mobile](https://github.com/nilenso/ashoka-survey-mobile),
  [survey-mobile-native](https://github.com/nilenso/ashoka-survey-mobile-native).

#### Process
The fellows at Ashoka first identify the problem sets based on the verticals mentioned above and create a questionnaire that will effectively capture the data necessary. Once that is done, they use the survey builder to quickly digitise them. These surveys can be shared with different registered organisations or shared publicly.

The responses are then collected by the field agents of the respective organizations using the mobile application that can take validated answers client-side and store them offline. These can be synced to survey-web, once the field agents get internet connectivity.

Here's a figure explaining the roles and interfaces of each of these applications:
  
![Architecture Diagram](https://cl.ly/image/3a0n2g0Q1A16/architecture.png)

We created a quick one-minute screencast that describes a simple workflow on how a survey is created, how a response is taken on that survey on the web and some basic reports you can see around it.

<video width="640" height="360" controls>
  <source src="https://cl.ly/0f0u0P0B2N21/ashoka-survey-screencast.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

We'll soon put up pictures of some of the trips we've been to, experiencing `survey-web` being used in the field. Stay tuned! 

#### Need for a separate auth app

The `user-owner` app was built to serve as a centralized auth provider for all of Ashoka's web services. It is implemented using the [doorkeeper](https://github.com/applicake/doorkeeper) gem.

#### Survey Builder amongst the alternatives available

[Wufoo](https://wufoo.com) and [Google Forms](https://forms.google.com) aren't designed for long surveys. They work well for short forms/questionnaires that can be answered on the web, but they do not have support for nesting questions or collecting responses from a mobile app offline.

[OpenDataKit](https://opendatakit.org) doesn't have a good interface for building long surveys or nested questions. It requires working with XLS files for many complex operations.

[SurveyMonkey](https://surveymonkey.com) is a good tool, but we couldn't use it since we needed complete ownership of the survey and response data.

#### Survey Builder V2
The current survey builder works well and is pretty functional, but it fails on a few usability aspects.

- Being able to switch between one question type to another. Simply using a drop-down bar instead of individual buttons to solve this.

- Editing concerns are shared across both panes, fine-grained question (question options, sub-questions etc.) level editing is on the left pane, more general editing and meta-information (type of question, maximum/minimum values for answers etc.) about the questions is on the right.

We worked together with Accenture to come up with new designs and started working on rebuilding it last month. It is still in progress, and can be viewed from the `create-v2` menu. The new visual designs are [here](https://github.com/nilenso/ashoka-survey-web/commit/a5aeb01fadedf43311a779412ef49c0c28081d92).

#### The Native Android App
The `survey-mobile` app is built with [Titanium](https://www.appcelerator.com/platform/titanium-platform/). We're looking to move away from this to a native android app. You can read a bit about where we're at in this [post](https://blog.nilenso.com/blog/2013/09/10/android-native-mvp/) and checkout the mockups [here](https://github.com/nilenso/ashoka-survey-mobile-native/commit/317c4692227249d9b476286d821493404b0acb0f).

#### Data Portal
Each survey conducted by Ashoka typically has about 300 responses. We currently have some basic reports built with google charts. But we don't have the ability to say, interpret data of similar/same respondents across multiple surveys.

Here are the mockups for the Data Portal section of things. You can figure this out.

#### Contribution
Each of these applications are entirely open-source, feel free to check them out on the [nilenso GitHub page](https://github.com/nilenso)!
