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

  // if (await Category.count() == 0) {
    
  //   await Category.createEach([
  //     { name: "Healthcare", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
  //     { name: "Legal Regulations", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
  //     { name: "Technical Advancements", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
  //     { name: "Business & Economics", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
  //     { name: "Market insights", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
  //   ])
  // }

  if (await ReportType.count() == 0) {
    
    await ReportType.createEach([
      { title: "Spam or misleading"},
      { title: "Hateful or abusive content"},
      // { title: "Suicide, self-injury or eating disorders"},
    ])
  }

  // if (await ReportSubTypes.count() == 0) {
    
  //   await ReportSubTypes.createEach([
  //     { title: "Spam or misleading - 1", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 1},
  //     { title: "Spam or misleading - 2", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 1},
  //     { title: "Spam or misleading - 3", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 1},
  //     { title: "Hateful or abusive content - 1", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 2},
  //     { title: "Hateful or abusive content - 2", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 2},
  //     { title: "Hateful or abusive content - 3", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 2},
  //     { title: "Suicide, self-injury or eating disorders - 1", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 3},
  //     { title: "Suicide, self-injury or eating disorders - 2", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 3},
  //     { title: "Suicide, self-injury or eating disorders - 3", description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', typeId: 3},
  //   ])
  // }

  // if (await Roles.count() == 0) {
    
  //   await Roles.createEach([
  //     { name: "Researcher" },
  //     { name: "Researcher Lead" },
  //     { name: "Content Writer" },
  //     { name: "Designer" },
  //     { name: "Auditor" },
  //     { name: "User" },
  //   ])
  // }

  // ```

};
