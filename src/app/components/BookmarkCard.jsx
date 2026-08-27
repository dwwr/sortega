import { useEffect, useRef, useState } from "react";
import { faviconUrl, hostnameOf, SWIPE_THRESHOLD } from "../lib/bookmarks.js";
import { copy } from "../copy.js";

export default function BookmarkCard({
  bookmark,
  behind = false,
  busy = false,
  flyAction = null,
  destIsTrash = false,
  onSwipe,
}) {
  const cardRef = useRef(null);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);

  const icon = faviconUrl(bookmark.url);
  const host = hostnameOf(bookmark.url);
  const fileOpacity = Math.min(1, Math.max(0, offset.x / SWIPE_THRESHOLD));
  const deleteOpacity = Math.min(1, Math.max(0, -offset.x / SWIPE_THRESHOLD));

  useEffect(() => {
    setIconFailed(false);
  }, [bookmark.url]);

  useEffect(() => {
    if (!flyAction) return undefined;
    setAnimating(true);
    const dx =
      flyAction === "file"
        ? window.innerWidth
        : flyAction === "delete"
          ? -window.innerWidth
          : 0;
    const dy = flyAction === "skip" ? window.innerHeight * 0.6 : 0;
    const next = { x: dx, y: dy };
    offsetRef.current = next;
    setOffset(next);
    return undefined;
  }, [flyAction]);

  function updateOffset(next) {
    offsetRef.current = next;
    setOffset(next);
  }

  function onPointerDown(event) {
    if (behind || busy || flyAction || event.button === 2) return;
    if (event.target.closest("a, button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY };
    setDragging(true);
    setAnimating(false);
  }

  function onPointerMove(event) {
    if (!dragRef.current) return;
    updateOffset({
      x: event.clientX - dragRef.current.startX,
      y: event.clientY - dragRef.current.startY,
    });
  }

  function onPointerUp() {
    if (!dragRef.current) return;
    const { x, y } = offsetRef.current;
    dragRef.current = null;
    setDragging(false);

    if (x > SWIPE_THRESHOLD) {
      onSwipe?.("file");
      return;
    }
    if (x < -SWIPE_THRESHOLD) {
      onSwipe?.("delete");
      return;
    }
    if (y > SWIPE_THRESHOLD) {
      onSwipe?.("skip");
      return;
    }

    setAnimating(true);
    updateOffset({ x: 0, y: 0 });
  }

  const transform = behind
    ? undefined
    : `translate(${offset.x}px, ${offset.y}px) rotate(${offset.x / 18}deg)`;

  // At rest, leave transform/opacity to CSS so promoting from `.behind`
  // can transition. Inline styles only while dragging / flying / snapping back.
  const style =
    behind || !(dragging || animating || flyAction)
      ? undefined
      : {
          transform,
          opacity: flyAction ? 0 : 1,
          transition: dragging
            ? "none"
            : "transform 0.28s ease, opacity 0.28s ease",
        };

  return (
    <article
      ref={cardRef}
      className={[
        "card",
        behind ? "behind" : "",
        dragging ? "dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      tabIndex={behind ? -1 : 0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={`stamp stamp-file${destIsTrash ? " trash" : ""}`}
        style={{ opacity: fileOpacity }}
      >
        {destIsTrash ? copy.card.stampTrash : copy.card.stampFile}
      </div>
      <div className="stamp stamp-delete" style={{ opacity: deleteOpacity }}>
        {copy.card.stampDelete}
      </div>

      <div className="preview">
        {icon && !iconFailed ? (
          <img
            className="favicon"
            src={icon}
            alt=""
            width={128}
            height={128}
            onError={() => setIconFailed(true)}
          />
        ) : (
          <div className="favicon-fallback" aria-hidden="true">
            {(host || copy.card.unknownHostInitial).slice(0, 1).toUpperCase()}
          </div>
        )}
        {host ? <p className="preview-host">{host}</p> : null}
      </div>

      <div className="meta">
        <h2 className="title">{bookmark.title}</h2>
        <a
          className="url"
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {bookmark.url}
        </a>
        <p className="folder">{bookmark.folderPath}</p>
      </div>
    </article>
  );
}
