package namespace

import (
	"net/http"

	"github.com/porter-dev/porter/api/server/authz"
	"github.com/porter-dev/porter/api/server/handlers"
	"github.com/porter-dev/porter/api/server/shared"
	"github.com/porter-dev/porter/api/server/shared/apierrors"
	"github.com/porter-dev/porter/api/server/shared/config"
	"github.com/porter-dev/porter/api/types"
	"github.com/porter-dev/porter/internal/models"
	"helm.sh/helm/v3/pkg/chart"
)

type ListReleasesHandler struct {
	handlers.PorterHandlerReadWriter
	authz.KubernetesAgentGetter
}

func NewListReleasesHandler(
	config *config.Config,
	decoderValidator shared.RequestDecoderValidator,
	writer shared.ResultWriter,
) *ListReleasesHandler {
	return &ListReleasesHandler{
		PorterHandlerReadWriter: handlers.NewDefaultPorterHandler(config, decoderValidator, writer),
		KubernetesAgentGetter:   authz.NewOutOfClusterAgentGetter(config),
	}
}

func (c *ListReleasesHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	request := &types.ListReleasesRequest{}

	if ok := c.DecodeAndValidate(w, r, request); !ok {
		return
	}

	namespace := r.Context().Value(types.NamespaceScope).(string)
	cluster, _ := r.Context().Value(types.ClusterScope).(*models.Cluster)

	helmAgent, err := c.GetHelmAgent(r, cluster)

	if err != nil {
		c.HandleAPIError(w, r, apierrors.NewErrInternal(err))
		return
	}

	releases, err := helmAgent.ListReleases(namespace, request.ReleaseListFilter)

	var optimizedReleaseList types.ListReleasesResponse

	// Clean up unused properties, these values are unnecesary to display the frontend rn
	for _, r := range releases {
		r.Chart.Files = []*chart.File{}
		r.Chart.Templates = []*chart.File{}
		r.Manifest = ""
		r.Chart.Values = nil
		r.Info.Notes = ""
		optimizedReleaseList = append(optimizedReleaseList, r)
	}

	if err != nil {
		c.HandleAPIError(w, r, apierrors.NewErrInternal(err))
		return
	}

	var res types.ListReleasesResponse = optimizedReleaseList

	c.WriteResult(w, r, res)
}
