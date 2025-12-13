import "dotenv/config";
import Computer from "tzafon";

import { searchForLasagnaAndRightClick } from "./automations";

const client: Computer = new Computer();

searchForLasagnaAndRightClick(client);
