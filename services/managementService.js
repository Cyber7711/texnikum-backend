const Management = require("../models/management");
const AppError = require("../utils/appError");

class ManagementService {
  static async getOne() {
    // bizda bitta doc bo‘ladi
    const doc = await Management.findOne();
    if (!doc) throw new AppError("Management doc topilmadi", 404);
    return doc;
  }

  static async ensureSeed() {
    const exists = await Management.findOne();
    if (exists) return exists;

    // Minimal seed (keyin admin paneldan o‘zgartirasan)
    const seeded = await Management.create({
      director: {
        id: "dir_1",
        name: "Director Name",
        position: "Texnikum Direktori",
        role: "director",
      },
      deputies: [],
      heads: [],
    });
    return seeded;
  }

  static findLeader(doc, leaderId) {
    if (doc.director?.id === leaderId) {
      return { type: "director", leader: doc.director };
    }

    const dep = doc.deputies.find((x) => x.id === leaderId);
    if (dep) return { type: "deputy", leader: dep };

    const head = doc.heads.find((x) => x.id === leaderId);
    if (head) return { type: "head", leader: head };

    return null;
  }

  static async updateLeader(leaderId, updateData) {
    const doc = await ManagementService.getOne();

    const found = ManagementService.findLeader(doc, leaderId);
    if (!found) throw new AppError("Bunday leaderId topilmadi", 404);

    // Xavfsizlik: ruxsat etilgan fieldlar
    const allowed = [
      "name",
      "position",
      "phone",
      "email",
      "reception",
      "bio",
      "education",
      "experience",
      "iconKey",
      "image",
    ];

    Object.keys(updateData).forEach((k) => {
      if (!allowed.includes(k)) delete updateData[k];
    });

    // merge
    Object.assign(found.leader, updateData);

    await doc.save();
    return doc;
  }
}

module.exports = ManagementService;
