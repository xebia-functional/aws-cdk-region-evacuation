# Support for Xebia Functional Blog Posts

This project has been created as a support for series of blog posts, so that you can quickly deploy the infrastructure and play around with it.

It contains the following folders:
```
├── dummy-server
├── infrastructure
└── README.md
```
* **infrastructure**: This folder contains the AWS infrastructure deployed by CDK (Typescript).
* **dummy-server**: This folder contains the container which runs in the infrastructure deployed previous.

# External resources
You will need to create or have the following resources before deploying these stacks:
* [Create an AWS account](https://repost.aws/knowledge-center/create-and-activate-aws-account). 
* Create a DNS Hosting account in [ClouDNS](https://www.cloudns.net) (with free account)

# Article References
| Article Link                                                      | Description                                                                                                                                     | Owner         |
|-------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| [first blog post](https://xebia.com/blog/kubernetes-and-the-jvm/) | In this section, we will review the deployment process for the related [infrastrcuture in this blog post](infrastructure/blog_post_1/README.md) | Jaime Navarro |
