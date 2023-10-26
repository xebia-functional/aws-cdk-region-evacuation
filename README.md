# Support for Xebia Functional Blog Posts

This project has been created as a support for a series of blog posts so that you can quickly deploy the infrastructure and play around with it.

It contains the following folders:
```
├── dummy-server
├── infrastructure
└── README.md
```
* **infrastructure**: This folder contains the AWS infrastructure deployed by CDK (Typescript).
* **dummy-server**: This folder contains the container that runs in the infrastructure deployed previously.

# External resources
You will need to create or have the following resources before deploying these stacks:
* [Create an AWS account](https://repost.aws/knowledge-center/create-and-activate-aws-account)
* Create a DNS Hosting account in [ClouDNS](https://www.cloudns.net) (with free account)

# Article References
| Article Link                                                                                   | Description                                                                                                                                     | Owner         |
|------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| [Revisiting networking concepts from the client’s perspective](https://xebia.com/blog/)        | The first article doesn't have any infrastructure to be deployed                                                                                | Jaime Navarro |
| [Deploy and Secure Web Public Endpoints](https://xebia.com/blog/)                              | In this section, we will review the deployment process for the related [infrastructure in this blog post](infrastructure/blog_post_2/README.md) | Jaime Navarro |
| [Region Evacuation with DNS approach](https://xebia.com/blog/)                                 | In this section, we will review the deployment process for the related [infrastructure in this blog post](infrastructure/blog_post_3/README.md) | Jaime Navarro |
| [Region Evacuation with static anycast IP approach](https://xebia.com/blog/)                   | In this section, we will review the deployment process for the related [infrastructure in this blog post](infrastructure/blog_post_4/README.md) | Jaime Navarro |