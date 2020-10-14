// Utilities.js

const utilitiesEnum = {
  NEWS: {
    CREATED: "News Created",
    UPDATED: "News Updated",
    DELETED: "News Deleted",
    STATUS: {
      IN_QUEUE: "in-queue",
      IN_CONTENT: "in-content",
      DRAFT: "draft",
      IN_DESIGN: "in-design",
      IN_REVIEW: "in-review",
      EDIT_REQUIRED: "edit-required",
      PUBLISHED: "published",
      SCHEDULED: "scheduled",
      REJECTED: "rejected",
      ON_HOLD: "on-hold",
    }
  }
};

module.exports = {
  activities: utilitiesEnum
};
