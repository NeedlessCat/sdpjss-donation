import express from "express";
import upload from "../middlewares/multer.js";

import { getNoticeList } from "../controllers/adminController.js";
import { getTeamMembers } from "../controllers/teamController.js";

const commonRouter = express.Router();
// ---------------------------
// Notice routes
commonRouter.get("/notice-list", getNoticeList);
commonRouter.get("/get-team-members", getTeamMembers);
export default commonRouter;
