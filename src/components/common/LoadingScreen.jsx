"use client";

import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { gradients } from "../../lib/tokens/colors";

const loadingVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const contentVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <Box
          component={motion.div}
          variants={loadingVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "subpixel-antialiased",
          }}
        >
          <Box
            component={motion.div}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: 48,
              }}
            >
              <DashboardIcon
                sx={{
                  fontSize: "3rem",
                  color: "#f97316",
                  filter: "drop-shadow(0 2px 4px rgba(249, 115, 22, 0.2))",
                  display: "block",
                  width: "3rem",
                  height: "3rem",
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: gradients.primary.default,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  filter: "drop-shadow(0 2px 4px rgba(249, 115, 22, 0.1))",
                  height: "1.2em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                GMB Review
              </Typography>
            </Box>
            <Box
              component={motion.div}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }}
              sx={{
                width: 40,
                height: 40,
                border: "3px solid rgba(249, 115, 22, 0.1)",
                borderTopColor: "#f97316",
                borderRadius: "50%",
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
            />
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}
