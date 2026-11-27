"use client";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useState, useSyncExternalStore, type MouseEvent } from "react";
import { useIntl } from "react-intl";

interface GalleryShareMenuProps {
  title: string;
  onCopied: () => void;
}

const subscribeNoop = () => () => {};

function getNativeShareSnapshot(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  );
}

function getNativeShareServerSnapshot(): boolean {
  return false;
}

export function GalleryShareMenu({ title, onCopied }: GalleryShareMenuProps) {
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const canNativeShare = useSyncExternalStore(
    subscribeNoop,
    getNativeShareSnapshot,
    getNativeShareServerSnapshot,
  );

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleShareWhatsApp = () => {
    const shareUrl = window.location.href;
    const message = intl.formatMessage(
      { id: "gallery.shareMessage" },
      { title },
    );
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    handleClose();
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    onCopied();
    handleClose();
  };

  const handleNativeShare = async () => {
    const shareUrl = window.location.href;
    const text = intl.formatMessage(
      { id: "gallery.shareMessage" },
      { title },
    );
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
    } catch {
      return;
    } finally {
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title={intl.formatMessage({ id: "gallery.share" })}>
        <IconButton
          size="small"
          onClick={handleOpen}
          aria-label={intl.formatMessage({ id: "gallery.share" })}
          aria-controls={open ? "gallery-share-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <ShareOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        id="gallery-share-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleShareWhatsApp}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage({ id: "gallery.shareWhatsApp" })}
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => void handleCopyLink()}>
          <ListItemIcon>
            <ContentCopyOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {intl.formatMessage({ id: "gallery.shareCopy" })}
          </ListItemText>
        </MenuItem>

        {canNativeShare && (
          <MenuItem onClick={() => void handleNativeShare()}>
            <ListItemIcon>
              <IosShareOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {intl.formatMessage({ id: "gallery.shareMore" })}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
