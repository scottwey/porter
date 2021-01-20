import React, { Component } from 'react';
import styled from 'styled-components';
import gradient from '../../../assets/gradient.jpg';

import api from '../../../shared/api';
import { Context } from '../../../shared/Context';
import { ProjectType, InfraType } from '../../../shared/types';

type PropsType = {
  currentProject: ProjectType,
  setCurrentView: (x: string, viewData?: any) => void,
  projects: ProjectType[],
};

type StateType = {
  expanded: boolean
};

export default class ProjectSection extends Component<PropsType, StateType> {
  state = {
    expanded: false,
  };

  handleSelectProject = (project: ProjectType) => {
    this.context.setCurrentProject(project);
    
    api.getInfra('<token>', {}, { project_id: project.id }, (err: any, res: any) => {
      if (err) {
        console.log(err);
      } else if (res.data) {

        let viewData = [] as any[]
        res.data.forEach((el: InfraType) => {
          if (el.status === 'creating') {
            viewData.push({
              infra_id: el.id,
              kind: el.kind,
            });
          }
        });

        if (viewData.length > 0) {
          this.props.setCurrentView('provisioner', viewData);
        } else {
          this.props.setCurrentView('dashboard');
        }
      }
    });
  }

  renderOptionList = () => {
    return this.props.projects.map((project: ProjectType, i: number) => {
      return (
        <Option
          key={i}
          selected={project.name === this.props.currentProject.name}
          onClick={() => this.handleSelectProject(project)}
        >
          <ProjectIcon>
            <ProjectImage src={gradient} />
            <Letter>{project.name[0].toUpperCase()}</Letter>
          </ProjectIcon>
          <ProjectLabel>{project.name}</ProjectLabel>
        </Option>
      );
    });
  }

  renderDropdown = () => {
    if (this.state.expanded) {
      return (
        <div>
          <CloseOverlay onClick={() => this.setState({ expanded: false })} />
          <Dropdown>
            {this.renderOptionList()}
            <Option
              selected={false}
              lastItem={true}
              onClick={() => this.props.setCurrentView('new-project')}
            >
              <ProjectIconAlt>+</ProjectIconAlt>
              <ProjectLabel>Create a Project</ProjectLabel>
            </Option>
          </Dropdown>
        </div>
      );
    }
  }

  handleExpand = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    let { currentProject } = this.props;
    if (currentProject) {
      return (
        <StyledProjectSection>
          <MainSelector
            onClick={this.handleExpand}
            expanded={this.state.expanded}
          >
            <ProjectIcon>
              <ProjectImage src={gradient} />
              <Letter>{currentProject.name[0].toUpperCase()}</Letter>
            </ProjectIcon>
            <ProjectName>{currentProject.name}</ProjectName>
            <i className="material-icons">arrow_drop_down</i>
          </MainSelector>
          {this.renderDropdown()}
        </StyledProjectSection>
      );
    }
    return (
      <InitializeButton onClick={() => this.props.setCurrentView('new-project')}>
        <Plus>+</Plus> Create a Project
      </InitializeButton>
    );
  }
}

ProjectSection.contextType = Context;

const ProjectLabel = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const AddButton = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 12px 15px;
`;

const Plus = styled.div`
  margin-right: 10px;
  font-size: 15px;
`;

const InitializeButton = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 30px);
  height: 38px;
  margin: 8px 15px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 3px;
  color: #ffffff;
  padding-bottom: 1px;
  cursor: pointer;
  background: #ffffff11;

  :hover {
    background: #ffffff22;
  }
`;

const Option = styled.div` 
  width: 100%;
  border-top: 1px solid #00000000;
  border-bottom: 1px solid ${(props: { selected: boolean, lastItem?: boolean }) => props.lastItem ? '#ffffff00' : '#ffffff15'};
  height: 45px;
  display: flex;
  align-items: center;
  font-size: 13px;
  align-items: center;
  padding-left: 10px;
  cursor: pointer;
  padding-right: 10px;
  background: ${(props: { selected: boolean, lastItem?: boolean }) => props.selected ? '#ffffff11' : ''};
  :hover {
    background: ${(props: { selected: boolean, lastItem?: boolean }) => props.selected ? '' : '#ffffff22'};
  }

  > i {
    font-size: 18px;
    margin-right: 12px;
    margin-left: 5px;
    color: #ffffff44;
  }
`;

const CloseOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
`;

const Dropdown = styled.div`
  position: absolute;
  right: 10px;
  top: calc(100% + 5px);
  background: #26282f;
  width: 180px;
  max-height: 500px;
  border-radius: 3px;
  z-index: 999;
  overflow-y: auto;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px 5px #00000077;
`;

const ProjectName = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Letter = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  background: #00000028;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 100%;
`;

const ProjectIcon = styled.div`
  width: 25px;
  min-width: 25px;
  height: 25px;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  margin-right: 10px;
  font-weight: 400;
`;

const ProjectIconAlt = styled(ProjectIcon)`
  border: 1px solid #ffffff44;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledProjectSection = styled.div`
  position: relative;
`;

const MainSelector = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 0;
  font-size: 14px;
  font-family: 'Work Sans', sans-serif;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 0;
  padding-left: 20px;
  :hover {
    > i {
      background: #ffffff22;
    }
  }

  > i {
    margin-left: 7px;
    margin-right: 12px;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    background: ${(props: { expanded: boolean }) => props.expanded ? '#ffffff22' : ''};
  }
`;