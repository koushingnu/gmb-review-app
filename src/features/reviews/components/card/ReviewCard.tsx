import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Rating,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Theme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ReplyIcon from "@mui/icons-material/Reply";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { formatDate } from "@/lib/utils/date";

interface Reviewer {
  displayName: string;
  profilePhotoUrl: string;
}

interface ReviewCardProps {
  review: {
    rating: number;
    comment: string;
    createTime: string;
    reviewer?: Reviewer;
    replied?: boolean;
  };
  onReply?: () => void;
}

const MotionCard = motion(Card);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const getRatingColor = (theme: Theme, rating: number): string => {
  if (rating >= 4) return theme.palette.success.main;
  if (rating >= 3) return theme.palette.warning.main;
  return theme.palette.error.main;
};

export function ReviewCard({
  review,
  onReply,
}: ReviewCardProps): React.ReactElement {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <MotionCard
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.5, ease: "easeOut" }}
      elevation={2}
      sx={{
        position: "relative",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: (theme) => getRatingColor(theme, review.rating),
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
          <Avatar
            src={review.reviewer?.profilePhotoUrl}
            alt={review.reviewer?.displayName}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" gutterBottom>
              {review.reviewer?.displayName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon
                sx={{ fontSize: "0.875rem", color: "text.secondary" }}
              />
              <Typography variant="body2" color="text.secondary">
                {formatDate(review.createTime)}
              </Typography>
            </Box>
          </Box>
          <Rating value={review.rating} readOnly precision={0.5} />
        </Box>

        <Typography
          variant="body1"
          color="text.primary"
          sx={{
            mb: 2,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {review.comment}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={`★${review.rating}`}
              size="small"
              color={
                review.rating >= 4
                  ? "success"
                  : review.rating >= 3
                    ? "warning"
                    : "error"
              }
            />
            {review.replied && (
              <Chip
                label="返信済み"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <Tooltip title="返信する">
            <IconButton color="primary" size="small" onClick={onReply}>
              <ReplyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </MotionCard>
  );
}
