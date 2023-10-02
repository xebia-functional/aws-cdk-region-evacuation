# AWS CDK TypeScript - Support for Xebia Functional Blog Posts

This project has been created as a support for series of blog posts, so that you can quickly deploy the infrastructure and play around with it.

It contains the following folders:
```
├── dummy-server
├── infrastructure
└── README.md
```
* **infrastructure**: AWS CDK configuration files.
* **dummy-server**: AWS CDK configuration files.
* **utilities**: AWS CDK configuration files.

# External resources
You will need to create or have the following resources before deploying these stacks:
* AWS account.
* DNS Hosting account. We will use https://www.cloudns.net/ (with free account)
  * To create a domain, by the default we use **_.cloudns.ph_**
* (optional) Docker Hub account: If you want to use your own docker image (dummy-server).

# Article References
| Article Link                                            | Description                                                               | Owner         |
|---------------------------------------------------------|---------------------------------------------------------------------------|---------------|
| [first_blog_post](infrastructure/blog_post_1/README.md) | In this section we review the deployment process for this first blog post | Jaime Navarro |
