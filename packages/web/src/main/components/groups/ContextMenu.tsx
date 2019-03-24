import React, { StatelessComponent, ReactNode } from "react"
import ReactDOM from "react-dom"

import { IPoint } from "common/geometry"

import "./ContextMenu.css"

function renderElement(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html
  return template.content.firstElementChild
}

export const createContextMenu = (childrenProvider: React.Factory<any>) => (
  e: React.MouseEvent
) => {
  let position: IPoint
  if (e.preventDefault) {
    e.preventDefault()
  }
  if (e.pageX !== undefined && e.pageY !== undefined) {
    position = {
      x: e.pageX,
      y: e.pageY
    }
  }

  const elm = renderElement(`<div class="ContextMenu" />`)
  document.querySelector("body").appendChild(elm)

  const close = () => elm.parentNode.removeChild(elm)

  ReactDOM.render(
    <ContextMenuOverlay position={position} close={close}>
      {childrenProvider(close)}
    </ContextMenuOverlay>,
    elm
  )
}

export interface ContextMenuOverlayProps {
  children?: ReactNode
  position: IPoint
  close: () => void
}

export const ContextMenuOverlay: StatelessComponent<
  ContextMenuOverlayProps
> = ({ children, position, close }) => {
  return (
    <div
      className="overlay"
      onMouseDown={close}
      onContextMenu={e => e.preventDefault()}
    >
      <div style={{ position: "absolute", left: position.x, top: position.y }}>
        {children}
      </div>
    </div>
  )
}

export interface ContextMenuProps {
  children?: ReactNode
}

export const ContextMenu: StatelessComponent<ContextMenuProps> = ({
  children
}) => {
  return (
    <div className="menu" onContextMenu={e => e.preventDefault()}>
      {children}
    </div>
  )
}

export interface MenuItemProps {
  children?: ReactNode
  onClick: (e: any) => void
  onMouseDown?: (e: any) => void
}

export const MenuItem: StatelessComponent<MenuItemProps> = ({
  children,
  onClick,
  onMouseDown
}) => {
  function _onClick(e: React.MouseEvent) {
    e.stopPropagation()
    onClick(e)
  }
  function _onMouseDown(e: React.MouseEvent) {
    e.stopPropagation()
    onMouseDown(e)
  }
  return (
    <div
      className="item"
      onClick={onClick && _onClick}
      onMouseDown={onMouseDown && _onMouseDown}
      onContextMenu={e => e.preventDefault()}
    >
      {children}
    </div>
  )
}

export type ContextMenuBuilder = (close: () => void) => ContextMenuItemContent[]

export function openContextMenu(
  e: React.MouseEvent,
  builder: ContextMenuBuilder
) {
  const contextMenu = (close: () => void) =>
    createContextMenuComponent(builder(close))
  const menuCreator = createContextMenu(contextMenu)
  return menuCreator(e)
}

export interface ContextMenuItemContent {
  isHidden?: boolean
  label: string
  onClick: () => void
}

export const createContextMenuComponent = (items: ContextMenuItemContent[]) => (
  <ContextMenu>
    {items
      .filter(i => i.isHidden !== true)
      .map((i, k) => (
        <MenuItem key={k} onClick={i.onClick}>
          {i.label}
        </MenuItem>
      ))}
  </ContextMenu>
)
