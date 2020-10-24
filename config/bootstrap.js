/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function() {

  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  if (await User.count() == 0) {
    await User.createEach([
      { email: 'arun.jain@bluone.in', name: 'Arun Jain', password: 'arun', role: 1 },
      { email: 'satish@bluone.in', name: 'Satish Verma', password: '123456', role: 1 },
      { email: 'farishta.sharma@bluone.in', name: 'Satish Verma', password: '123456', role: 2 },
      { email: 'skumar.arya@bluone.in', name: 'Sachin Arya', password: '123456', role: 3 },
      { email: 'saurabh.thukral@bluone.in', name: 'Saurabh Thukral', password: '123456', role: 2 },
      { email: 'neha.bajpayee@bluone.in', name: 'Neha Bajpayee', password: '123456', role: 3 },
      // etc.
    ]);
  }
  //

  if (await Category.count() == 0) {
    await Category.createEach([
      { name: "Healthcare", description: "The group will have story categories like news articles, medical insurances, caregivers, mental health, pharma, wellness, etc."},
      { name: "Legal Regulations", description: "This group will contain story categories that will include lawsuits, executive moves, FDA, CMS, COBRA, CDC etc."},
      { name: "Technical Advancements", description: "This group will have story categories like IoT, payment technologies, medical devices, wearables, new drug developments etc."},
      { name: "Business Economics", description: "This group will have categories of mergers & acquisitions, joint ventures, startups, venture funding, government funding etc."},
      { name: "Market insights", description: "The group will have stories that contain market data of healthcare companies, research papers, business profits/loss etc."},
    ])
  }

  if (await ReportType.count() == 0) {
    
    await ReportType.createEach([
      { title: "Spam or misleading"},
      { title: "Hateful or abusive content"},
      // { title: "Suicide, self-injury or eating disorders"},
    ])
  }

  if (await ReportSubTypes.count() == 0) {
    await ReportSubTypes.createEach([
      { title: "Content is excessively posted and repetitive.", description: '', typeId: 1},
      { title: "Promises for news but instead redirects to malicious sites.", description: '', typeId: 1},
      { title: "Manipulative data.", description: '', typeId: 1},
      { title: "Content has extended name calling or malicious insults.", description: '', typeId: 2},
      { title: "Content intendeds to shame, deceive or insult a minor or survivors.", description: '', typeId: 2},
      { title: "Abusive language.", description: '', typeId: 2},
    ])
  }

  if (await Roles.count() == 0) {
    await Roles.createEach([
      { name: "Admin", published_view: {"view":false,"date":false}, table: {"newsHeadline":false,"group":false,"linkAdded":false,"approved":false,"assigned":false,"schedule":false,"published":false,"link":false,"submit":false} },
      { name: "Auditor", published_view: {"view":false,"date":false}, table: {"newsHeadline":false,"group":false,"linkAdded":false,"approved":false,"assigned":false,"schedule":false,"published":false,"link":false,"submit":false} },
      { name: "Member", published_view: {"view":false,"date":false}, table: {"newsHeadline":false,"group":false,"linkAdded":false,"approved":false,"assigned":false,"schedule":false,"published":false,"link":false,"submit":false} },
      { name: "User", published_view: {"view":false,"date":false}, table: {"newsHeadline":false,"group":false,"linkAdded":false,"approved":false,"assigned":false,"schedule":false,"published":false,"link":false,"submit":false} },
    ])
  }

  // ```

};
