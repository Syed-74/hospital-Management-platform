import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../config/db.js";

export const getDashboards = catchAsync(async (req, res, next) => {
  const dashboards = await prisma.dashboard.findMany({
    orderBy: { name: 'asc' }
  });
  res.status(200).json({ status: "success", data: { dashboards } });
});
