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
      { email: 'arun.jain@bluone.in', name: 'Arun Jain', password: 'arun' },
      { email: 'satish@bluone.in', name: 'Satish Verma', password: '123456' },
      // etc.
    ]);
  }
  //

  if (await Category.count() == 0) {
    
    await Category.createEach([
      { name: "Health 01", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
      { name: "Health 02", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
      { name: "Health 03", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
      { name: "Health 04", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
      { name: "Health 05", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
      { name: "Health 06", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse viverra sollicitudin erat, nec ullamcorper enim tincidunt cursus. Sed imperdiet risus velit, ut molestie nisl ultricies"},
    ])
  }

  // ```

};
