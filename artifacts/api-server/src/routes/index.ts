import { Router, type IRouter } from "express";
import healthRouter from "./health";
import countriesRouter from "./countries";
import timelineRouter from "./timeline";
import milestonesRouter from "./milestones";
import storiesRouter from "./stories";
import walkInShoesRouter from "./walk-in-shoes";
import pledgeRouter from "./pledge";
import humanityTimelineRouter from "./humanity-timeline";
import profileRouter from "./profile";
import connectionsRouter from "./connections";
import messagesRouter from "./messages";
import dinnerTableRouter from "./dinner-table";
import storageRouter from "./storage";
import musicRouter from "./music";
import worldNewsRouter from "./world-news";
import complianceRouter from "./compliance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(musicRouter);
router.use(humanityTimelineRouter);
router.use(walkInShoesRouter);
router.use(pledgeRouter);
router.use(profileRouter);
router.use(connectionsRouter);
router.use(messagesRouter);
router.use(dinnerTableRouter);
router.use(worldNewsRouter);
router.use(complianceRouter);
router.use(countriesRouter);
router.use(timelineRouter);
router.use(milestonesRouter);
router.use(storiesRouter);

export default router;
