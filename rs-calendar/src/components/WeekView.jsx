import React, { Component } from 'react';
import { connect } from 'react-redux';
import { changeView } from '../actions';
import TimeLine from './TimeLine';
import DayNames from './DayNames.jsx';

class WeekView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      week: props.dateFromState.clone()
    };
  }
  componentWillMount() {
    this.props.changeView('week')
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      week: nextProps.dateFromState.clone()
    });
  }
  getWeekDays() {
    const days = [];
    let date = this.state.week.clone().startOf('week');
    for (let i = 0; i < 7; i++) {
      days.push(
        <TimeLine
          key={i}
          date = {date}
          isToday = {date.isSame(new Date(), 'day')}
          className="day-slot"
          isShown={false}
        />
      )
      date = date.clone();
      date.add(1,'day');
    }
    return days;
  }
  render() {
    if(this.props.isEventsFetching) {
      return(<i className="fa fa-spinner fa-spin"></i>)
    }
    return (
      <section className="week-view">
        <DayNames className="week-view__day-names" weekStartDate={this.state.week.clone().startOf('week')}/>
        <div className="week-view__content">
          <TimeLine className="time-gutter" isShown={true} date={this.state.week.clone().startOf('day')} />
          {this.getWeekDays()}
        </div>
      </section>
    );
  }
}
function mapStateToProps(state) {
  return {
    dateFromState: state.calendarNavigation.date.clone(),
    isEventsFetching: state.ajaxDataHandler.isEventsFetching
  }
}
export default connect (mapStateToProps, { changeView }) (WeekView);
