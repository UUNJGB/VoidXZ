import { Events } from "discord.js";
import { logger, startupLog } from "../utils/logger.js";
import config from "../config/application.js";
import { reconcileReactionRoleMessages } from "../services/reactionRoleService.js";

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    try {
      // Set initial presence
      client.user.setPresence(config.bot.presence).catch(error => {
        logger.error("Failed to set initial presence:", error);
      });

      startupLog(`Ready! Logged in as ${client.user.tag}`);
      startupLog(`Serving ${client.guilds.cache.size} guild(s)`);
      startupLog(`Loaded ${client.commands.size} commands`);

      const reconciliationSummary = await reconcileReactionRoleMessages(client);
      startupLog(
        `Reaction role reconciliation: scanned ${reconciliationSummary.scannedMessages}, removed ${reconciliationSummary.removedMessages}, errors ${reconciliationSummary.errors}`
      );

      // Update presence every 30 seconds to keep it active
      setInterval(() => {
        try {
          client.user.setPresence(config.bot.presence).catch(error => {
            logger.error("Failed to update presence:", error);
          });
        } catch (error) {
          logger.error("Error updating presence:", error);
        }
      }, 30000);

    } catch (error) {
      logger.error("Error in ready event:", error);
    }
  },
};

