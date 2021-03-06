import React from 'react'
import withHooks, {
  usePropsMemo,
  useSeriesStyle,
  useDatumStyle
} from '../utils/hooks'

//

import Utils from '../utils/Utils'

//
import Circle from '../primitives/Circle'

const circleDefaultStyle = {
  r: 2
}

function Bubble({ series }) {
  const style = useSeriesStyle(series)

  return (
    <g>
      {series.datums.map((datum, i) => {
        return (
          <Point
            {...{
              key: i,
              datum,
              style
            }}
          />
        )
      })}
    </g>
  )
}

Bubble.plotDatum = (datum, { primaryAxis, secondaryAxis, xAxis, yAxis }) => {
  datum.primaryCoord = primaryAxis.scale(datum.primary)
  datum.secondaryCoord = secondaryAxis.scale(datum.secondary)
  datum.x = xAxis.scale(datum.xValue)
  datum.y = yAxis.scale(datum.yValue)
  datum.defined =
    Utils.isValidPoint(datum.xValue) && Utils.isValidPoint(datum.yValue)
  datum.base = primaryAxis.vertical
    ? xAxis.scale(datum.baseValue)
    : yAxis.scale(datum.baseValue)
  // Adjust non-bar elements for ordinal scales
  if (xAxis.type === 'ordinal') {
    datum.x += xAxis.tickOffset
  }
  if (yAxis.type === 'ordinal') {
    datum.y += yAxis.tickOffset
  }

  // Set the default anchor point
  datum.anchor = {
    x: datum.x,
    y: datum.y,
    verticalPadding: datum.r,
    horizontalPadding: datum.r
  }

  // Set the pointer points (used in voronoi)
  datum.boundingPoints = [datum.anchor]
}

Bubble.buildStyles = (series, { defaultColors }) => {
  const defaults = {
    // Pass some sane defaults
    color: defaultColors[series.index % (defaultColors.length - 1)]
  }

  Utils.buildStyleGetters(series, defaults)
}

const Point = withHooks(function Point({ datum, style }) {
  if (!datum.defined) {
    return null
  }

  const dataStyle = useDatumStyle(datum)

  const circleProps = {
    x: datum ? datum.x : undefined,
    y: datum ? datum.y : undefined,
    style: {
      ...circleDefaultStyle,
      ...style,
      ...style.circle,
      ...dataStyle,
      ...dataStyle.circle,
      ...(typeof datum.r !== 'undefined'
        ? {
          r: datum.r
        }
        : {})
    }
  }
  return usePropsMemo(() => <Circle {...circleProps} />, circleProps)
})

export default withHooks(Bubble)
