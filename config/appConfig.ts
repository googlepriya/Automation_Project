// config/config.js
export const APP_CONFIG = {
  // App-specific connection credentials

  connection: {
    Highperformr: {
      workflow_names: "new_contact_in_segment",
      name: "Highperformr",
      baseUrl: "https://app.highperformr.ai",
      apiKey: "hp-3d6f9b47-f2c5-4871-9486-d6de879898e7",
      appType: "auth", // Specify app type for connection creation
    },
    Freshsales: {
      workflow_names: "new_contact",
      name: "FS Connection",
      domain: "app-freshworks",
      apiKey: "EJPrQP8i5rgCGHQmkc6zMA",
      appType: "auth", // Specify app type for connection creation
    },
    Hubspot: {
      workflow_names: "new_record",
      name: "Hubspot Connection",
      baseUrl: "https://app.hubspot.com",
      apiKey: "hubspot-api-key",
      appType: "oauth", // Specify app type for connection creation
    },
    GetBeamer: {
      workflow_names: "New Post Created",
      name: "GetBeamer Connection",
      baseUrl: "https://api.getbeamer.com/v0",
      apiKey: "b_pih0iLn6p5AK56TAbLYy2bGuZRG8sl01rkKxmDZcHOk=",
      appType: "auth", // Specify app type for connection creation
    },
    ServiceNow: {
      name: "ServiceNow Connection",
      baseUrl: "https://app.servicenow.com",
      apiKey: "servicenow-api-key",
      appType: "oauth", // Specify app type for connection creation
    },
    EmSigner: {
      name: "EmSigner Connection",
      baseUrl: "https://app.emsigner.com",
      apiKey: "emsigner-api-key",
      appType: "oauth", // Specify app type for connection creation
    },
    mindbody: {
      workflow_names: "new_client",
      name: "Mindbody Connection",
      siteId: "-99",
      apiKey: "9500e1454b2749aaa2aa227328a38603",
      appType: "auth", // Specify app type for connection creation
  },

  // Workflow triggers for each app
  workflow_names: {
    Highperformr: {
      NewContactInSegment: "new_contact_in_segment",
      UpdateContactInSegment: "update_contact_in_segment",
    },
    EmSigner: {
      DocumentCompleted: "Document Completed",
    },
    "Microsoft Teams": {
      NewChannelMessage: "New Channel Message", // Example workflow for Microsoft Teams
    },

    "Catch Hook": {
      CatchHook: "Catch Hook", // Example workflow
    },
    mindbody: {
      //Not working this one
      NewAddedClient: "new_client", // Monitor for new clients in your MindBody system
      UpdatedClient: "updated_client", // Monitor for updated clients in your MindBody system
    },
    "Featurely Webhook Ap...": {
      StaticWebhook: "Static Webhook", // Example workflow
    },
    Apollo: {
      NewAccount: "New Account", // Example workflow
    },

    Freshsales: {
      NewContact: "new_contact",
      UpdatedContact: "updated_contact",
      NewAccount: "new_account",
      UpdatedAccount: "updated_account",
      NewDeal: "new_deal",
      UpdatedDeal: "updated_deal",
    },
    Hubspot: {
      NewRecord: "new_record", // Added this as per the new HTML structure
      UpdatedRecord: "updated_record", // Added this as per the new HTML structure
      NewRecordsInList: "New Records In List", // Added this as per the new HTML structure
    },
    GetBeamer: {
      NewPostCreated: "New Post Created", // Monitor for new posts in Beamer feed
      NewCommentCreated: "New Comment Created", // Monitor for new comments on posts or feature requests
      NewFeatureRequestCreated: "New Feature Request Created", // Monitor for new feature requests in the feedback board
      NewNpsResponse: "New NPS Response", // Monitor for new Net Promoter Score responses
      PostCreatedWebhook: "Post Created (Webhook)", // Real-time notifications when posts are created
      PostUpdatedWebhook: "Post Updated (Webhook)", // Real-time notifications when posts are updated
      PostDeletedWebhook: "Post Deleted (Webhook)", // Real-time notifications when posts are deleted
      FeedbackSentWebhook: "Feedback Sent (Webhook)", // Real-time notifications when feedback is sent
      FeatureRequestCreatedWebhook: "Feature Request Created (Webhook)", // Real-time notifications when feature requests are created
      UserCreatedWebhook: "User Created (Webhook)", // Real-time notifications when users are created
      UserUpdatedWebhook: "User Updated (Webhook)", // Real-time notifications when users are updated
      ReactionSentWebhook: "Reaction Sent (Webhook)", // Real-time notifications when users react to posts
      FeatureRequestVoteWebhook: "Feature Request Vote (Webhook)", // Real-time notifications when users vote on feature requests
      FeatureRequestCommentWebhook: "Feature Request Comment (Webhook)", // Real-time notifications when comments are added to feature requests
    },
    ServiceNow: {
      NewRecord: "new_record",
      UpdatedRecord: "updated_record",
    },

    Freshdesk: {
      NewCompany: "New Company", // Fires when a new company is created in HubSpot
      UpdatedCompany: "Updated Company", // Fires when an existing company is modified in HubSpot
      NewContact: "New Contact", // Fires when a new contact is created in HubSpot
      UpdatedContact: "Updated Contact", // Fires when an existing contact is modified in HubSpot
      NewTicket: "New Ticket", // Fires when a new ticket is created in HubSpot
      UpdatedTicket: "Updated Ticket", // Fires when an existing ticket is modified in HubSpot
    },
    Salesforce: {
      NewRecord: "new_record", // Example workflow
      UpdatedRecord: "updated_record", // Example workflow
    },

    Liongard: {
      NewDeviceCreated: "New Device Created", // Monitor for newly created devices in your Liongard environment
      DeviceUpdated: "Device Updated", // Monitor for updated devices in your Liongard environment
      NewSystemCreated: "New System Created", // Monitor for newly created systems in your Liongard environment
      SystemUpdated: "System Updated", // Monitor for updated systems in your Liongard environment
      NewMetricCreated: "New Metric Created", // Monitor for newly created metrics in your Liongard environment
      MetricUpdated: "Metric Updated", // Monitor for updated metrics in your Liongard environment
      NewUserCreated: "New User Created", // Monitor for newly created users in your Liongard environment
      UserUpdated: "User Updated", // Monitor for updated users in your Liongard environment
    },

    "Microsoft OneDrive": {
      NewFile: "New File", // Monitor for new files in OneDrive
      NewFolder: "New Folder", // Monitor for new folder in OneDrive
    },
  },
  action_workflow_names: {
    Vercel: {
      DeploymentSuccess: "Deployment Success", // Example workflow
      DeploymentFailure: "Deployment Failure", // Example workflow
    },
  },
},
}
